import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/customerGroup';
import * as groupServices from '../../services/customerGroup';
import logger from '../../utilities/logger';

const router = Router();

const createController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: createCustomerGroupController');
  try {
    const group = await groupServices.createCustomerGroup(req.body);
    logger.info('Exit: createCustomerGroupController — success');
    res.status(201).json(group);
  } catch (error) {
    logger.error(`Exit: createCustomerGroupController — error: ${error}`);
    next(error);
  }
};

const listController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: listCustomerGroupsController');
  try {
    const groups = await groupServices.listCustomerGroups(req.query.search as string | undefined);
    logger.info('Exit: listCustomerGroupsController — success');
    res.json(groups);
  } catch (error) {
    logger.error(`Exit: listCustomerGroupsController — error: ${error}`);
    next(error);
  }
};

const getController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: getCustomerGroupController');
  try {
    const group = await groupServices.getCustomerGroup(req.params.id as string);
    logger.info('Exit: getCustomerGroupController — success');
    res.json(group);
  } catch (error) {
    logger.error(`Exit: getCustomerGroupController — error: ${error}`);
    next(error);
  }
};

const updateController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: updateCustomerGroupController');
  try {
    const group = await groupServices.updateCustomerGroup(req.params.id as string, req.body);
    logger.info('Exit: updateCustomerGroupController — success');
    res.json(group);
  } catch (error) {
    logger.error(`Exit: updateCustomerGroupController — error: ${error}`);
    next(error);
  }
};

const deleteController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: deleteCustomerGroupController');
  try {
    const result = await groupServices.deleteCustomerGroup(req.params.id as string);
    logger.info('Exit: deleteCustomerGroupController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: deleteCustomerGroupController — error: ${error}`);
    next(error);
  }
};

const addMemberController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: addMemberController');
  try {
    const membership = await groupServices.addMember(req.params.id as string, req.body.customerId);
    logger.info('Exit: addMemberController — success');
    res.status(201).json(membership);
  } catch (error) {
    logger.error(`Exit: addMemberController — error: ${error}`);
    next(error);
  }
};

const removeMemberController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: removeMemberController');
  try {
    const result = await groupServices.removeMember(req.params.id as string, req.params.customerId as string);
    logger.info('Exit: removeMemberController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: removeMemberController — error: ${error}`);
    next(error);
  }
};

router
  .route('/')
  .post(validateRequest(policies.createCustomerGroupPolicy), createController)
  .get(validateRequest(policies.listCustomerGroupsPolicy), listController);

router
  .route('/:id')
  .get(validateRequest(policies.getCustomerGroupPolicy), getController)
  .put(validateRequest(policies.updateCustomerGroupPolicy), updateController)
  .delete(validateRequest(policies.deleteCustomerGroupPolicy), deleteController);

router
  .route('/:id/members')
  .post(validateRequest(policies.addMemberPolicy), addMemberController);

router
  .route('/:id/members/:customerId')
  .delete(validateRequest(policies.removeMemberPolicy), removeMemberController);

export default router;
