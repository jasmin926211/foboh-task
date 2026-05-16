import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ResourceNotFoundException, NegativePriceException, ConflictException } from '../../utilities/exceptions';
import computePrice from '../../utilities/computePrice';
import { CreateProfileBody, UpdateProfileBody, PreviewPricesBody } from '../../policies/pricingProfile';

// --- Helper: validate that no computed prices are negative ---

async function validateNoPricesNegative(params: {
  scope: 'all' | 'selected';
  productIds?: string[];
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease' | null;
  adjustmentValue?: number | null;
  customPrices?: Record<string, number>;
}) {
  // For custom, validate from the customPrices map
  if (params.adjustmentType === 'custom') {
    if (!params.customPrices) return;
    const negatives: { productId: string; productTitle: string; basePrice: number; computedPrice: number }[] = [];
    const products = await prisma.product.findMany({
      where: { id: { in: Object.keys(params.customPrices) }, deletedAt: null },
    });
    for (const product of products) {
      const customPrice = params.customPrices[product.id];
      if (customPrice < 0) {
        negatives.push({
          productId: product.id,
          productTitle: product.title,
          basePrice: product.basePrice,
          computedPrice: customPrice,
        });
      }
    }
    if (negatives.length > 0) throw new NegativePriceException(negatives);
    return;
  }

  const products =
    params.scope === 'all'
      ? await prisma.product.findMany({ where: { deletedAt: null } })
      : await prisma.product.findMany({ where: { id: { in: params.productIds ?? [] }, deletedAt: null } });

  const negatives: { productId: string; productTitle: string; basePrice: number; computedPrice: number }[] = [];

  for (const product of products) {
    const computed = computePrice(product.basePrice, {
      adjustmentType: params.adjustmentType,
      adjustmentDirection: params.adjustmentDirection,
      adjustmentValue: params.adjustmentValue,
    });
    if (computed < 0) {
      negatives.push({
        productId: product.id,
        productTitle: product.title,
        basePrice: product.basePrice,
        computedPrice: computed,
      });
    }
  }

  if (negatives.length > 0) {
    throw new NegativePriceException(negatives);
  }
}

// --- Check Name ---

export const checkProfileNameExists = async (name: string, excludeId?: string): Promise<boolean> => {
  const where: any = { name: { equals: name, mode: 'insensitive' } };
  if (excludeId) where.id = { not: excludeId };
  const count = await prisma.pricingProfile.count({ where });
  return count > 0;
};

// --- Create ---

export const createProfile = async (body: CreateProfileBody) => {
  logger.info('Entry: createProfile service');

  const scope = body.scope ?? 'selected';
  const status = body.status ?? 'draft';
  const isCustom = body.adjustmentType === 'custom';

  // Check for duplicate profile name
  const existing = await prisma.pricingProfile.findFirst({
    where: { name: { equals: body.name, mode: 'insensitive' } },
  });
  if (existing) {
    throw new ConflictException(`A pricing profile named "${body.name}" already exists`);
  }

  await validateNoPricesNegative({
    scope,
    productIds: body.productIds,
    adjustmentType: body.adjustmentType,
    adjustmentDirection: body.adjustmentDirection,
    adjustmentValue: body.adjustmentValue,
    customPrices: body.customPrices,
  });

  // Create one profile per customer name
  const profiles = await Promise.all(
    body.customerNames.map((customerName) =>
      prisma.pricingProfile.create({
        data: {
          name: body.name,
          customerName,
          adjustmentType: body.adjustmentType,
          adjustmentDirection: isCustom ? null : (body.adjustmentDirection ?? null),
          adjustmentValue: isCustom ? null : (body.adjustmentValue ?? null),
          status,
          scope,
          ...(scope === 'selected' && body.productIds && {
            profileProducts: {
              create: body.productIds.map((productId) => ({
                productId,
                ...(isCustom && body.customPrices && { customPrice: body.customPrices[productId] ?? null }),
              })),
            },
          }),
        },
        include: { profileProducts: { include: { product: true } } },
      })
    )
  );

  logger.info(`Exit: createProfile service — created ${profiles.length} profile(s)`);
  return profiles;
};

// --- List ---

export const listProfiles = async (
  customerName?: string,
  status?: 'draft' | 'published',
  page: number = 1,
  limit: number = 10,
) => {
  logger.info('Entry: listProfiles service');

  const where: any = {};
  if (customerName) {
    where.OR = [
      { customerName: { contains: customerName, mode: 'insensitive' } },
      { name: { contains: customerName, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;

  const [profiles, total] = await Promise.all([
    prisma.pricingProfile.findMany({
      where,
      include: { profileProducts: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pricingProfile.count({ where }),
  ]);

  logger.info(`Exit: listProfiles service — found ${profiles.length} of ${total} profiles`);
  return { data: profiles, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// --- Get ---

export const getProfile = async (id: string) => {
  logger.info('Entry: getProfile service');

  const profile = await prisma.pricingProfile.findUnique({
    where: { id },
    include: { profileProducts: { include: { product: true } } },
  });

  if (!profile) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  const isCustom = profile.adjustmentType === 'custom';

  let products: { id: string; title: string; sku: string; basePrice: number }[];

  if (profile.scope === 'all') {
    const allProducts = await prisma.product.findMany({ where: { deletedAt: null } });
    products = allProducts;
  } else {
    products = profile.profileProducts
      .filter((pp) => pp.product.deletedAt === null)
      .map((pp) => pp.product);
  }

  // Build a lookup of customPrices from junction rows
  const customPriceLookup: Record<string, number | null> = {};
  if (isCustom) {
    for (const pp of profile.profileProducts) {
      customPriceLookup[pp.productId] = pp.customPrice;
    }
  }

  const computedPrices = products.map((product) => ({
    productId: product.id,
    productTitle: product.title,
    sku: product.sku,
    basePrice: product.basePrice,
    newPrice: isCustom
      ? (customPriceLookup[product.id] ?? product.basePrice)
      : computePrice(product.basePrice, {
          adjustmentType: profile.adjustmentType,
          adjustmentDirection: profile.adjustmentDirection,
          adjustmentValue: profile.adjustmentValue,
        }),
  }));

  logger.info('Exit: getProfile service — success');
  return { ...profile, computedPrices };
};

// --- Update ---

export const updateProfile = async (id: string, body: UpdateProfileBody) => {
  logger.info('Entry: updateProfile service');

  const existing = await prisma.pricingProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  const effectiveScope = (body.scope ?? existing.scope) as 'all' | 'selected';
  const effectiveAdjType = (body.adjustmentType ?? existing.adjustmentType) as 'fixed' | 'dynamic' | 'custom';
  const isCustom = effectiveAdjType === 'custom';

  if (!isCustom) {
    const effectiveAdjDir = (body.adjustmentDirection ?? existing.adjustmentDirection) as 'increase' | 'decrease';
    const effectiveAdjVal = (body.adjustmentValue ?? existing.adjustmentValue) as number;

    await validateNoPricesNegative({
      scope: effectiveScope,
      productIds: body.productIds,
      adjustmentType: effectiveAdjType,
      adjustmentDirection: effectiveAdjDir,
      adjustmentValue: effectiveAdjVal,
    });
  } else {
    await validateNoPricesNegative({
      scope: effectiveScope,
      productIds: body.productIds,
      adjustmentType: 'custom',
      customPrices: body.customPrices,
    });
  }

  const { productIds, customPrices, ...updateData } = body;

  // Null out direction/value when switching to custom
  if (isCustom) {
    (updateData as any).adjustmentDirection = null;
    (updateData as any).adjustmentValue = null;
  }

  // Handle scope transitions and product updates
  let profileProductsUpdate: any = undefined;
  if (body.scope === 'all' && existing.scope !== 'all') {
    profileProductsUpdate = { deleteMany: {} };
  } else if (body.scope === 'selected' && existing.scope === 'all' && productIds) {
    profileProductsUpdate = {
      deleteMany: {},
      create: productIds.map((productId) => ({
        productId,
        ...(isCustom && customPrices && { customPrice: customPrices[productId] ?? null }),
      })),
    };
  } else if (productIds) {
    profileProductsUpdate = {
      deleteMany: {},
      create: productIds.map((productId) => ({
        productId,
        ...(isCustom && customPrices && { customPrice: customPrices[productId] ?? null }),
      })),
    };
  }

  const profile = await prisma.pricingProfile.update({
    where: { id },
    data: {
      ...updateData,
      ...(profileProductsUpdate && { profileProducts: profileProductsUpdate }),
    },
    include: { profileProducts: { include: { product: true } } },
  });

  logger.info('Exit: updateProfile service — success');
  return profile;
};

// --- Delete ---

export const deleteProfile = async (id: string) => {
  logger.info('Entry: deleteProfile service');

  const existing = await prisma.pricingProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  await prisma.pricingProfile.delete({ where: { id } });

  logger.info('Exit: deleteProfile service — success');
  return { message: 'Profile deleted successfully' };
};

// --- Resolve Price (single product) ---

export const resolvePrice = async (productId: string, customerName: string) => {
  logger.info('Entry: resolvePrice service');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ResourceNotFoundException(`Product with id ${productId} not found`);
  }

  if (product.deletedAt !== null) {
    return {
      productId: product.id,
      productTitle: product.title,
      basePrice: product.basePrice,
      newPrice: product.basePrice,
      appliedProfile: null,
      reason: 'Product is soft-deleted; returning base price.',
      candidateProfiles: [],
      rejectedProfiles: [],
    };
  }

  const profiles = await prisma.pricingProfile.findMany({
    where: {
      customerName,
      status: 'published',
      OR: [
        { scope: 'all' },
        { profileProducts: { some: { productId } } },
      ],
    },
    include: { profileProducts: { where: { productId } } },
    orderBy: { updatedAt: 'desc' },
  });

  if (profiles.length === 0) {
    return {
      productId: product.id,
      productTitle: product.title,
      basePrice: product.basePrice,
      newPrice: product.basePrice,
      appliedProfile: null,
      reason: 'No published profiles matched this product.',
      candidateProfiles: [],
      rejectedProfiles: [],
    };
  }

  const candidateProfiles = profiles.map((p) => {
    const isCustom = p.adjustmentType === 'custom';
    const junctionRow = p.profileProducts[0];
    const computedPrice = isCustom
      ? (junctionRow?.customPrice ?? product.basePrice)
      : computePrice(product.basePrice, {
          adjustmentType: p.adjustmentType,
          adjustmentDirection: p.adjustmentDirection,
          adjustmentValue: p.adjustmentValue,
        });

    return {
      id: p.id,
      name: p.name,
      adjustment: {
        type: p.adjustmentType,
        direction: p.adjustmentDirection,
        value: p.adjustmentValue,
      },
      computedPrice,
      updatedAt: p.updatedAt,
      scope: p.scope,
    };
  });

  const draftProfiles = await prisma.pricingProfile.findMany({
    where: {
      customerName,
      status: 'draft',
      OR: [
        { scope: 'all' },
        { profileProducts: { some: { productId } } },
      ],
    },
  });

  const rejectedProfiles = draftProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    rejectionReason: 'Profile is in draft status',
  }));

  const winningProfile = profiles[0];
  const isWinnerCustom = winningProfile.adjustmentType === 'custom';
  const winnerJunction = winningProfile.profileProducts[0];
  const newPrice = isWinnerCustom
    ? (winnerJunction?.customPrice ?? product.basePrice)
    : computePrice(product.basePrice, {
        adjustmentType: winningProfile.adjustmentType,
        adjustmentDirection: winningProfile.adjustmentDirection,
        adjustmentValue: winningProfile.adjustmentValue,
      });

  const matchCount = profiles.length;
  const reason = `Applied profile '${winningProfile.name}' (most recently updated). ${matchCount} profile${matchCount > 1 ? 's' : ''} matched.`;

  logger.info('Exit: resolvePrice service — success');
  return {
    productId: product.id,
    productTitle: product.title,
    basePrice: product.basePrice,
    newPrice,
    appliedProfile: { id: winningProfile.id, name: winningProfile.name },
    reason,
    candidateProfiles,
    rejectedProfiles,
  };
};

// --- Resolve All Prices ---

export const resolveAllPrices = async (customerName: string) => {
  logger.info('Entry: resolveAllPrices service');

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { title: 'asc' },
  });

  const results = await Promise.all(
    products.map((product) => resolvePrice(product.id, customerName))
  );

  logger.info('Exit: resolveAllPrices service — success');
  return results;
};

// --- Preview Prices ---

export const previewPrices = async (body: PreviewPricesBody) => {
  logger.info('Entry: previewPrices service');

  const scope = body.scope ?? 'selected';
  const isCustom = body.adjustmentType === 'custom';

  const products =
    scope === 'all'
      ? await prisma.product.findMany({ where: { deletedAt: null }, orderBy: { title: 'asc' } })
      : await prisma.product.findMany({
          where: { id: { in: body.productIds ?? [] }, deletedAt: null },
          orderBy: { title: 'asc' },
        });

  const warnings: string[] = [];

  const results = products.map((product) => {
    let newPrice: number;
    let adjustmentAmount: number;

    if (isCustom && body.customPrices) {
      newPrice = body.customPrices[product.id] ?? product.basePrice;
      adjustmentAmount = newPrice - product.basePrice;
    } else {
      newPrice = computePrice(product.basePrice, {
        adjustmentType: body.adjustmentType,
        adjustmentDirection: body.adjustmentDirection,
        adjustmentValue: body.adjustmentValue,
      });
      adjustmentAmount =
        body.adjustmentType === 'fixed'
          ? (body.adjustmentValue ?? 0)
          : (product.basePrice * (body.adjustmentValue ?? 0)) / 100;
    }

    if (newPrice < 0) {
      warnings.push(`"${product.title}" would have a negative price ($${newPrice.toFixed(2)})`);
    }

    return {
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      category: product.subCategory,
      basePrice: product.basePrice,
      adjustment: Math.round(adjustmentAmount * 100) / 100,
      newPrice,
    };
  });

  logger.info(`Exit: previewPrices service — computed ${results.length} prices`);
  return { results, warnings };
};
