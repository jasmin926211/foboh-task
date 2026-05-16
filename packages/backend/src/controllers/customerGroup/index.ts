import { Router } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/customerGroup';
import * as groupServices from '../../services/customerGroup';
import wrapController from '../../utilities/controllerWrapper';

const router = Router();

const createCustomerGroupController = wrapController('createCustomerGroupController', async (req) => ({
  status: 201,
  data: await groupServices.createCustomerGroup(req.body),
}));

const listCustomerGroupsController = wrapController('listCustomerGroupsController', async (req) => ({
  data: await groupServices.listCustomerGroups(req.query.search as string | undefined),
}));

const getCustomerGroupController = wrapController('getCustomerGroupController', async (req) => ({
  data: await groupServices.getCustomerGroup(req.params.id as string),
}));

const updateCustomerGroupController = wrapController('updateCustomerGroupController', async (req) => ({
  data: await groupServices.updateCustomerGroup(req.params.id as string, req.body),
}));

const deleteCustomerGroupController = wrapController('deleteCustomerGroupController', async (req) => ({
  data: await groupServices.deleteCustomerGroup(req.params.id as string),
}));

const addMemberController = wrapController('addMemberController', async (req) => ({
  status: 201,
  data: await groupServices.addMember(req.params.id as string, req.body.customerId),
}));

const removeMemberController = wrapController('removeMemberController', async (req) => ({
  data: await groupServices.removeMember(req.params.id as string, req.params.customerId as string),
}));

router
  .route('/')
  .post(validateRequest(policies.createCustomerGroupPolicy), createCustomerGroupController)
  .get(validateRequest(policies.listCustomerGroupsPolicy), listCustomerGroupsController);

router
  .route('/:id')
  .get(validateRequest(policies.getCustomerGroupPolicy), getCustomerGroupController)
  .put(validateRequest(policies.updateCustomerGroupPolicy), updateCustomerGroupController)
  .delete(validateRequest(policies.deleteCustomerGroupPolicy), deleteCustomerGroupController);

router
  .route('/:id/members')
  .post(validateRequest(policies.addMemberPolicy), addMemberController);

router
  .route('/:id/members/:customerId')
  .delete(validateRequest(policies.removeMemberPolicy), removeMemberController);

export default router;
