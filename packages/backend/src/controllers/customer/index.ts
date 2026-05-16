import { Router } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/customer';
import * as customerServices from '../../services/customer';
import wrapController from '../../utilities/controllerWrapper';

const router = Router();

const createCustomerController = wrapController('createCustomerController', async (req) => ({
  status: 201,
  data: await customerServices.createCustomer(req.body),
}));

const listCustomersController = wrapController('listCustomersController', async (req) => ({
  data: await customerServices.listCustomers(req.query.search as string | undefined),
}));

const getCustomerController = wrapController('getCustomerController', async (req) => ({
  data: await customerServices.getCustomer(req.params.id as string),
}));

const updateCustomerController = wrapController('updateCustomerController', async (req) => ({
  data: await customerServices.updateCustomer(req.params.id as string, req.body),
}));

const deleteCustomerController = wrapController('deleteCustomerController', async (req) => ({
  data: await customerServices.deleteCustomer(req.params.id as string),
}));

router
  .route('/')
  .post(validateRequest(policies.createCustomerPolicy), createCustomerController)
  .get(validateRequest(policies.listCustomersPolicy), listCustomersController);

router
  .route('/:id')
  .get(validateRequest(policies.getCustomerPolicy), getCustomerController)
  .put(validateRequest(policies.updateCustomerPolicy), updateCustomerController)
  .delete(validateRequest(policies.deleteCustomerPolicy), deleteCustomerController);

export default router;
