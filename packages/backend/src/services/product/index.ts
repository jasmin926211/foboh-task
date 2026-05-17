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
      { sku: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  if (filters.subCategory) where.subCategory = filters.subCategory;
  if (filters.segment) where.segment = filters.segment;
  if (filters.brand) where.brand = filters.brand;

  const products = await prisma.product.findMany({ where, orderBy: { title: 'asc' } });

  logger.info(`Exit: listProducts service -found ${products.length} products`);
  return products;
};

export const getProduct = async (id: string) => {
  logger.info('Entry: getProduct service');

  const product = await findOrThrow(prisma.product.findUnique({ where: { id } }), 'Product', id);

  logger.info('Exit: getProduct service -success');
  return product;
};

export const updateProduct = async (
  id: string,
  body: { costPrice?: number | null; minMarginPercent?: number | null }
) => {
  logger.info('Entry: updateProduct service');

  await findOrThrow(prisma.product.findUnique({ where: { id } }), 'Product', id);

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
      ...(body.minMarginPercent !== undefined && { minMarginPercent: body.minMarginPercent })
    }
  });

  logger.info('Exit: updateProduct service -success');
  return updated;
};

export const deleteProduct = async (id: string) => {
  logger.info('Entry: deleteProduct service');

  await findOrThrow(prisma.product.findUnique({ where: { id, deletedAt: null } }), 'Product', id);

  const [deleted] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
    prisma.profileProduct.deleteMany({
      where: { productId: id },
    }),
  ]);

  logger.info('Exit: deleteProduct service -success');
  return deleted;
};

