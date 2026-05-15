import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ResourceNotFoundException } from '../../utilities/exceptions';

export const listProducts = async (filters: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}) => {
  logger.info('Entry: listProducts service');

  const where: any = {};

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

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new ResourceNotFoundException(`Product with id ${id} not found`);
  }

  logger.info('Exit: getProduct service — success');
  return product;
};
