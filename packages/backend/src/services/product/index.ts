import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import findOrThrow from '../../utilities/findOrThrow';

export const listProducts = async (filters: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}) => {
  logger.info('Entry: listProducts service');

  const where: any = { deletedAt: null };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.subCategory) where.subCategory = filters.subCategory;
  if (filters.segment) where.segment = filters.segment;
  if (filters.brand) where.brand = filters.brand;

  const products = await prisma.product.findMany({ where, orderBy: { title: 'asc' } });

  logger.info(`Exit: listProducts service — found ${products.length} products`);
  return products;
};

export const getProduct = async (id: string) => {
  logger.info('Entry: getProduct service');

  const product = await findOrThrow(prisma.product.findUnique({ where: { id } }), 'Product', id);

  logger.info('Exit: getProduct service — success');
  return product;
};

export const softDeleteProduct = async (id: string) => {
  logger.info('Entry: softDeleteProduct service');

  await findOrThrow(prisma.product.findUnique({ where: { id } }), 'Product', id);

  const updated = await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  logger.info('Exit: softDeleteProduct service — success');
  return updated;
};
