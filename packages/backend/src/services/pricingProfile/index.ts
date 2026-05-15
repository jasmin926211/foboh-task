import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ResourceNotFoundException, InternalServerException } from '../../utilities/exceptions';
import computePrice from '../../utilities/computePrice';
import { CreateProfileBody, UpdateProfileBody } from '../../policies/pricingProfile';

export const createProfile = async (body: CreateProfileBody) => {
  logger.info('Entry: createProfile service');

  const profile = await prisma.pricingProfile.create({
    data: {
      name: body.name,
      customerName: body.customerName,
      adjustmentType: body.adjustmentType,
      adjustmentDirection: body.adjustmentDirection,
      adjustmentValue: body.adjustmentValue,
      profileProducts: {
        create: body.productIds.map((productId) => ({ productId })),
      },
    },
    include: { profileProducts: { include: { product: true } } },
  });

  logger.info('Exit: createProfile service — success');
  return profile;
};

export const listProfiles = async (customerName?: string) => {
  logger.info('Entry: listProfiles service');

  const where = customerName ? { customerName } : {};

  const profiles = await prisma.pricingProfile.findMany({
    where,
    include: { profileProducts: true },
    orderBy: { updatedAt: 'desc' },
  });

  logger.info(`Exit: listProfiles service — found ${profiles.length} profiles`);
  return profiles;
};

export const getProfile = async (id: string) => {
  logger.info('Entry: getProfile service');

  const profile = await prisma.pricingProfile.findUnique({
    where: { id },
    include: { profileProducts: { include: { product: true } } },
  });

  if (!profile) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  const computedPrices = profile.profileProducts.map((pp) => ({
    productId: pp.product.id,
    productTitle: pp.product.title,
    sku: pp.product.sku,
    basePrice: pp.product.basePrice,
    newPrice: computePrice(pp.product.basePrice, {
      adjustmentType: profile.adjustmentType,
      adjustmentDirection: profile.adjustmentDirection,
      adjustmentValue: profile.adjustmentValue,
    }),
  }));

  logger.info('Exit: getProfile service — success');
  return { ...profile, computedPrices };
};

export const updateProfile = async (id: string, body: UpdateProfileBody) => {
  logger.info('Entry: updateProfile service');

  const existing = await prisma.pricingProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  const { productIds, ...updateData } = body;

  const profile = await prisma.pricingProfile.update({
    where: { id },
    data: {
      ...updateData,
      ...(productIds && {
        profileProducts: {
          deleteMany: {},
          create: productIds.map((productId) => ({ productId })),
        },
      }),
    },
    include: { profileProducts: { include: { product: true } } },
  });

  logger.info('Exit: updateProfile service — success');
  return profile;
};

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

export const resolvePrice = async (productId: string, customerName: string) => {
  logger.info('Entry: resolvePrice service');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ResourceNotFoundException(`Product with id ${productId} not found`);
  }

  const profiles = await prisma.pricingProfile.findMany({
    where: {
      customerName,
      profileProducts: { some: { productId } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (profiles.length === 0) {
    return {
      productId: product.id,
      productTitle: product.title,
      basePrice: product.basePrice,
      newPrice: product.basePrice,
      profileId: null,
      profileName: null,
    };
  }

  const winningProfile = profiles[0];

  logger.info('Exit: resolvePrice service — success');
  return {
    productId: product.id,
    productTitle: product.title,
    basePrice: product.basePrice,
    newPrice: computePrice(product.basePrice, {
      adjustmentType: winningProfile.adjustmentType,
      adjustmentDirection: winningProfile.adjustmentDirection,
      adjustmentValue: winningProfile.adjustmentValue,
    }),
    profileId: winningProfile.id,
    profileName: winningProfile.name,
  };
};

export const resolveAllPrices = async (customerName: string) => {
  logger.info('Entry: resolveAllPrices service');

  const products = await prisma.product.findMany({ orderBy: { title: 'asc' } });

  const results = await Promise.all(
    products.map((product) => resolvePrice(product.id, customerName))
  );

  logger.info('Exit: resolveAllPrices service — success');
  return results;
};
