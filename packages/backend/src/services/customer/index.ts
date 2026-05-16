import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ConflictException } from '../../utilities/exceptions';
import findOrThrow from '../../utilities/findOrThrow';
import { CreateCustomerBody, UpdateCustomerBody } from '../../policies/customer';

const includeWithGroups = { memberships: { include: { customerGroup: true } } };

export const createCustomer = async (body: CreateCustomerBody) => {
  logger.info('Entry: createCustomer service');

  const existing = await prisma.customer.findFirst({
    where: { name: { equals: body.name, mode: 'insensitive' } },
  });
  if (existing) {
    throw new ConflictException(`A customer named "${body.name}" already exists`);
  }

  const customer = await prisma.customer.create({
    data: { name: body.name, email: body.email },
    include: includeWithGroups,
  });

  logger.info('Exit: createCustomer service — success');
  return customer;
};

export const listCustomers = async (search?: string) => {
  logger.info('Entry: listCustomers service');

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: includeWithGroups,
    orderBy: { name: 'asc' },
  });

  logger.info(`Exit: listCustomers service — found ${customers.length} customers`);
  return customers;
};

export const getCustomer = async (id: string) => {
  logger.info('Entry: getCustomer service');

  const customer = await findOrThrow(
    prisma.customer.findUnique({ where: { id }, include: includeWithGroups }),
    'Customer',
    id,
  );

  logger.info('Exit: getCustomer service — success');
  return customer;
};

export const updateCustomer = async (id: string, body: UpdateCustomerBody) => {
  logger.info('Entry: updateCustomer service');

  await findOrThrow(prisma.customer.findUnique({ where: { id } }), 'Customer', id);

  if (body.name) {
    const duplicate = await prisma.customer.findFirst({
      where: { name: { equals: body.name, mode: 'insensitive' }, id: { not: id } },
    });
    if (duplicate) {
      throw new ConflictException(`A customer named "${body.name}" already exists`);
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: body,
    include: includeWithGroups,
  });

  logger.info('Exit: updateCustomer service — success');
  return customer;
};

export const deleteCustomer = async (id: string) => {
  logger.info('Entry: deleteCustomer service');

  await findOrThrow(prisma.customer.findUnique({ where: { id } }), 'Customer', id);

  await prisma.customer.delete({ where: { id } });

  logger.info('Exit: deleteCustomer service — success');
  return { message: 'Customer deleted successfully' };
};
