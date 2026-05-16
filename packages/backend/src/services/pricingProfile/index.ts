import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ResourceNotFoundException, NegativePriceException, ConflictException } from '../../utilities/exceptions';
import computePrice from '../../utilities/computePrice';
import findOrThrow from '../../utilities/findOrThrow';
import { CreateProfileBody, UpdateProfileBody, PreviewPricesBody } from '../../policies/pricingProfile';
import { PROFILE_SCOPE, PROFILE_STATUS, ADJUSTMENT_TYPE, PAGINATION, PERCENTAGE_DIVISOR } from '../../constants';

// --- Helper: validate that no computed prices are negative ---

async function validateNoPricesNegative(params: {
  scope: 'all' | 'selected';
  productIds?: string[];
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease' | null;
  adjustmentValue?: number | null;
  customPrices?: Record<string, number>;
}) {
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

  const scope = body.scope ?? PROFILE_SCOPE.SELECTED;
  const status = body.status ?? PROFILE_STATUS.DRAFT;
  const isCustom = body.adjustmentType === ADJUSTMENT_TYPE.CUSTOM;

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

  const profile = await prisma.pricingProfile.create({
    data: {
      name: body.name,
      customerId: body.customerId ?? null,
      customerGroupId: body.customerGroupId ?? null,
      adjustmentType: body.adjustmentType,
      adjustmentDirection: isCustom ? null : (body.adjustmentDirection ?? null),
      adjustmentValue: isCustom ? null : (body.adjustmentValue ?? null),
      status,
      scope,
      ...(scope === PROFILE_SCOPE.SELECTED && body.productIds && {
        profileProducts: {
          create: body.productIds.map((productId) => ({
            productId,
            ...(isCustom && body.customPrices && { customPrice: body.customPrices[productId] ?? null }),
          })),
        },
      }),
    },
    include: {
      profileProducts: { include: { product: true } },
      customer: true,
      customerGroup: true,
    },
  });

  logger.info('Exit: createProfile service — created profile');
  return profile;
};

// --- List ---

export const listProfiles = async (
  search?: string,
  status?: 'draft' | 'published',
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT,
) => {
  logger.info('Entry: listProfiles service');

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customerGroup: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (status) where.status = status;

  const [profiles, total] = await Promise.all([
    prisma.pricingProfile.findMany({
      where,
      include: {
        profileProducts: true,
        customer: true,
        customerGroup: true,
      },
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

  const profile = await findOrThrow(
    prisma.pricingProfile.findUnique({
      where: { id },
      include: {
        profileProducts: { include: { product: true } },
        customer: true,
        customerGroup: true,
      },
    }),
    'Pricing profile',
    id,
  );

  const isCustom = profile.adjustmentType === ADJUSTMENT_TYPE.CUSTOM;

  let products: { id: string; title: string; sku: string; basePrice: number }[];

  if (profile.scope === PROFILE_SCOPE.ALL) {
    const allProducts = await prisma.product.findMany({ where: { deletedAt: null } });
    products = allProducts;
  } else {
    products = profile.profileProducts
      .filter((pp) => pp.product.deletedAt === null)
      .map((pp) => pp.product);
  }

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

  const existing = await findOrThrow(
    prisma.pricingProfile.findUnique({ where: { id } }),
    'Pricing profile',
    id,
  );

  const effectiveScope = (body.scope ?? existing.scope) as 'all' | 'selected';
  const effectiveAdjType = (body.adjustmentType ?? existing.adjustmentType) as 'fixed' | 'dynamic' | 'custom';
  const isCustom = effectiveAdjType === ADJUSTMENT_TYPE.CUSTOM;

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

  if (isCustom) {
    (updateData as any).adjustmentDirection = null;
    (updateData as any).adjustmentValue = null;
  }

  let profileProductsUpdate: any = undefined;
  if (body.scope === PROFILE_SCOPE.ALL && existing.scope !== PROFILE_SCOPE.ALL) {
    profileProductsUpdate = { deleteMany: {} };
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
    include: {
      profileProducts: { include: { product: true } },
      customer: true,
      customerGroup: true,
    },
  });

  logger.info('Exit: updateProfile service — success');
  return profile;
};

// --- Delete ---

export const deleteProfile = async (id: string) => {
  logger.info('Entry: deleteProfile service');

  await findOrThrow(prisma.pricingProfile.findUnique({ where: { id } }), 'Pricing profile', id);

  await prisma.pricingProfile.delete({ where: { id } });

  logger.info('Exit: deleteProfile service — success');
  return { message: 'Profile deleted successfully' };
};

// --- Specificity Tier Labels ---

const TIER_LABELS: Record<number, string> = {
  1: 'Customer + Selected Products',
  2: 'Customer + All Products',
  3: 'Group + Selected Products',
  4: 'Group + All Products',
  5: 'All Customers + Selected Products',
  6: 'All Customers + All Products',
};

function computeTier(profile: {
  customerId: string | null;
  customerGroupId: string | null;
  scope: string;
  matchedViaGroup?: boolean;
}): number {
  if (profile.customerId) {
    return profile.scope === PROFILE_SCOPE.SELECTED ? 1 : 2;
  }
  if (profile.customerGroupId) {
    return profile.scope === PROFILE_SCOPE.SELECTED ? 3 : 4;
  }
  // All customers
  return profile.scope === PROFILE_SCOPE.SELECTED ? 5 : 6;
}

// --- Resolve Price (single product) with 6-tier specificity ---

export const resolvePrice = async (productId: string, customerId: string) => {
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
      tier: null,
      tierLabel: null,
      reason: 'Product is soft-deleted; returning base price.',
      candidateProfiles: [],
      rejectedProfiles: [],
    };
  }

  // Look up the customer and their group memberships
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { memberships: true },
  });
  if (!customer) {
    throw new ResourceNotFoundException(`Customer with id ${customerId} not found`);
  }

  const groupIds = customer.memberships.map((m) => m.customerGroupId);

  // Find all published profiles that could apply
  const profiles = await prisma.pricingProfile.findMany({
    where: {
      status: PROFILE_STATUS.PUBLISHED,
      OR: [
        { customerId },
        ...(groupIds.length > 0 ? [{ customerGroupId: { in: groupIds } }] : []),
        { customerId: null, customerGroupId: null },
      ],
    },
    include: {
      profileProducts: { where: { productId } },
      customer: true,
      customerGroup: true,
    },
  });

  // Filter to profiles that cover this product
  const matchingProfiles = profiles.filter((p) => {
    if (p.scope === PROFILE_SCOPE.ALL) return true;
    return p.profileProducts.length > 0;
  });

  if (matchingProfiles.length === 0) {
    // Check for rejected draft profiles
    const draftProfiles = await prisma.pricingProfile.findMany({
      where: {
        status: PROFILE_STATUS.DRAFT,
        AND: [
          {
            OR: [
              { customerId },
              ...(groupIds.length > 0 ? [{ customerGroupId: { in: groupIds } }] : []),
              { customerId: null, customerGroupId: null },
            ],
          },
          {
            OR: [
              { scope: PROFILE_SCOPE.ALL },
              { profileProducts: { some: { productId } } },
            ],
          },
        ],
      },
    });

    const rejectedProfiles = draftProfiles.map((p) => ({
      id: p.id,
      name: p.name,
      rejectionReason: 'Profile is in draft status',
    }));

    return {
      productId: product.id,
      productTitle: product.title,
      basePrice: product.basePrice,
      newPrice: product.basePrice,
      appliedProfile: null,
      tier: null,
      tierLabel: null,
      reason: 'No published profiles matched this product.',
      candidateProfiles: [],
      rejectedProfiles,
    };
  }

  // Compute tier for each matching profile, then compute price
  const candidatesWithTier = matchingProfiles.map((p) => {
    const isCustom = p.adjustmentType === ADJUSTMENT_TYPE.CUSTOM;
    const junctionRow = p.profileProducts[0];
    const computedNewPrice = isCustom
      ? (junctionRow?.customPrice ?? product.basePrice)
      : computePrice(product.basePrice, {
          adjustmentType: p.adjustmentType,
          adjustmentDirection: p.adjustmentDirection,
          adjustmentValue: p.adjustmentValue,
        });

    const tier = computeTier({
      customerId: p.customerId,
      customerGroupId: p.customerGroupId,
      scope: p.scope,
    });

    return {
      id: p.id,
      name: p.name,
      customerName: p.customer?.name ?? p.customerGroup?.name ?? 'All Customers',
      adjustment: {
        type: p.adjustmentType,
        direction: p.adjustmentDirection,
        value: p.adjustmentValue,
      },
      computedPrice: computedNewPrice,
      updatedAt: p.updatedAt,
      scope: p.scope,
      tier,
      tierLabel: TIER_LABELS[tier],
    };
  });

  // Sort by tier ASC, then updatedAt DESC
  candidatesWithTier.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const winner = candidatesWithTier[0];

  // Find rejected draft profiles
  const draftProfiles = await prisma.pricingProfile.findMany({
    where: {
      status: PROFILE_STATUS.DRAFT,
      OR: [
        { customerId },
        ...(groupIds.length > 0 ? [{ customerGroupId: { in: groupIds } }] : []),
        { customerId: null, customerGroupId: null },
      ],
    },
  });

  const rejectedProfiles = draftProfiles.map((p) => ({
      id: p.id,
      name: p.name,
      rejectionReason: 'Profile is in draft status',
    }));

  const reason = `Applied profile '${winner.name}' (Tier ${winner.tier} — ${winner.tierLabel}). ${candidatesWithTier.length} profile${candidatesWithTier.length > 1 ? 's' : ''} matched.`;

  logger.info('Exit: resolvePrice service — success');
  return {
    productId: product.id,
    productTitle: product.title,
    basePrice: product.basePrice,
    newPrice: winner.computedPrice,
    appliedProfile: { id: winner.id, name: winner.name },
    tier: winner.tier,
    tierLabel: winner.tierLabel,
    reason,
    candidateProfiles: candidatesWithTier,
    rejectedProfiles,
  };
};

// --- Resolve All Prices ---

export const resolveAllPrices = async (customerId: string) => {
  logger.info('Entry: resolveAllPrices service');

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { title: 'asc' },
  });

  const results = await Promise.all(
    products.map((product) => resolvePrice(product.id, customerId))
  );

  logger.info('Exit: resolveAllPrices service — success');
  return results;
};

// --- Preview Prices ---

export const previewPrices = async (body: PreviewPricesBody) => {
  logger.info('Entry: previewPrices service');

  const scope = body.scope ?? PROFILE_SCOPE.SELECTED;
  const isCustom = body.adjustmentType === ADJUSTMENT_TYPE.CUSTOM;

  const products =
    scope === PROFILE_SCOPE.ALL
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
        body.adjustmentType === ADJUSTMENT_TYPE.FIXED
          ? (body.adjustmentValue ?? 0)
          : (product.basePrice * (body.adjustmentValue ?? 0)) / PERCENTAGE_DIVISOR;
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
