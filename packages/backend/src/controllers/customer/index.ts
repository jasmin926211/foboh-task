import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/customer';
import * as customerServices from '../../services/customer';
import logger from '../../utilities/logger';

const router = Router();

const createCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: createCustomerController');
  try {
    const customer = await customerServices.createCustomer(req.body);
    logger.info('Exit: createCustomerController — success');
    res.status(201).json(customer);
  } catch (error) {
    logger.error(`Exit: createCustomerController — error: ${error}`);
    next(error);
  }
};

const listCustomersController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: listCustomersController');
  try {
    const customers = await customerServices.listCustomers(req.query.search as string | undefined);
    logger.info('Exit: listCustomersController — success');
    res.json(customers);
  } catch (error) {
    logger.error(`Exit: listCustomersController — error: ${error}`);
    next(error);
  }
};

const getCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: getCustomerController');
  try {
    const customer = await customerServices.getCustomer(req.params.id as string);
    logger.info('Exit: getCustomerController — success');
    res.json(customer);
  } catch (error) {
    logger.error(`Exit: getCustomerController — error: ${error}`);
    next(error);
  }
};

const updateCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: updateCustomerController');
  try {
    const customer = await customerServices.updateCustomer(req.params.id as string, req.body);
    logger.info('Exit: updateCustomerController — success');
    res.json(customer);
  } catch (error) {
    logger.error(`Exit: updateCustomerController — error: ${error}`);
    next(error);
  }
};

const deleteCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: deleteCustomerController');
  try {
    const result = await customerServices.deleteCustomer(req.params.id as string);
    logger.info('Exit: deleteCustomerController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: deleteCustomerController — error: ${error}`);
    next(error);
  }
};

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
