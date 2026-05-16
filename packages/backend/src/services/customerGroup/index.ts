import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ConflictException, ResourceNotFoundException } from '../../utilities/exceptions';
import findOrThrow from '../../utilities/findOrThrow';
import { CreateCustomerGroupBody, UpdateCustomerGroupBody } from '../../policies/customerGroup';

const includeMembers = {
  memberships: {
    include: { customer: true },
  },
};

export const createCustomerGroup = async (body: CreateCustomerGroupBody) => {
  logger.info('Entry: createCustomerGroup service');

  const existing = await prisma.customerGroup.findFirst({
    where: { name: { equals: body.name, mode: 'insensitive' } },
  });
  if (existing) {
    throw new ConflictException(`A customer group named "${body.name}" already exists`);
  }

  const group = await prisma.customerGroup.create({
    data: { name: body.name, description: body.description },
    include: includeMembers,
  });

  logger.info('Exit: createCustomerGroup service — success');
  return group;
};

export const listCustomerGroups = async (search?: string) => {
  logger.info('Entry: listCustomerGroups service');

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const groups = await prisma.customerGroup.findMany({
    where,
    include: { memberships: { include: { customer: true } }, _count: { select: { memberships: true } } },
    orderBy: { name: 'asc' },
  });

  logger.info(`Exit: listCustomerGroups service — found ${groups.length} groups`);
  return groups;
};

export const getCustomerGroup = async (id: string) => {
  logger.info('Entry: getCustomerGroup service');

  const group = await findOrThrow(
    prisma.customerGroup.findUnique({ where: { id }, include: { memberships: { include: { customer: true } } } }),
    'Customer group',
    id,
  );

  logger.info('Exit: getCustomerGroup service — success');
  return group;
};

export const updateCustomerGroup = async (id: string, body: UpdateCustomerGroupBody) => {
  logger.info('Entry: updateCustomerGroup service');

  await findOrThrow(prisma.customerGroup.findUnique({ where: { id } }), 'Customer group', id);

  if (body.name) {
    const duplicate = await prisma.customerGroup.findFirst({
      where: { name: { equals: body.name, mode: 'insensitive' }, id: { not: id } },
    });
    if (duplicate) {
      throw new ConflictException(`A customer group named "${body.name}" already exists`);
    }
  }

  const group = await prisma.customerGroup.update({
    where: { id },
    data: body,
    include: includeMembers,
  });

  logger.info('Exit: updateCustomerGroup service — success');
  return group;
};

export const deleteCustomerGroup = async (id: string) => {
  logger.info('Entry: deleteCustomerGroup service');

  await findOrThrow(prisma.customerGroup.findUnique({ where: { id } }), 'Customer group', id);

  await prisma.customerGroup.delete({ where: { id } });

  logger.info('Exit: deleteCustomerGroup service — success');
  return { message: 'Customer group deleted successfully' };
};

export const addMember = async (groupId: string, customerId: string) => {
  logger.info('Entry: addMember service');

  await findOrThrow(prisma.customerGroup.findUnique({ where: { id: groupId } }), 'Customer group', groupId);
  const customer = await findOrThrow(prisma.customer.findUnique({ where: { id: customerId } }), 'Customer', customerId);

  const existing = await prisma.customerGroupMembership.findUnique({
    where: { customerId_customerGroupId: { customerId, customerGroupId: groupId } },
  });
  if (existing) {
    throw new ConflictException(`Customer "${customer.name}" is already a member of this group`);
  }

  const membership = await prisma.customerGroupMembership.create({
    data: { customerId, customerGroupId: groupId },
    include: { customer: true, customerGroup: true },
  });

  logger.info('Exit: addMember service — success');
  return membership;
};

export const removeMember = async (groupId: string, customerId: string) => {
  logger.info('Entry: removeMember service');

  const membership = await prisma.customerGroupMembership.findUnique({
    where: { customerId_customerGroupId: { customerId, customerGroupId: groupId } },
  });
  if (!membership) {
    throw new ResourceNotFoundException('Membership not found');
  }

  await prisma.customerGroupMembership.delete({
    where: { id: membership.id },
  });

  logger.info('Exit: removeMember service — success');
  return { message: 'Member removed successfully' };
};
