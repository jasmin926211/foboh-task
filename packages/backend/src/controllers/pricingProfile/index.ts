import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/pricingProfile';
import * as profileServices from '../../services/pricingProfile';
import logger from '../../utilities/logger';

const router = Router();

const createProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: createProfileController');
  try {
    const profile = await profileServices.createProfile(req.body);
    logger.info('Exit: createProfileController — success');
    res.status(201).json(profile);
  } catch (error) {
    logger.error(`Exit: createProfileController — error: ${error}`);
    next(error);
  }
};

const listProfilesController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: listProfilesController');
  try {
    const profiles = await profileServices.listProfiles(req.query.customerName as string | undefined);
    logger.info('Exit: listProfilesController — success');
    res.json(profiles);
  } catch (error) {
    logger.error(`Exit: listProfilesController — error: ${error}`);
    next(error);
  }
};

const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: getProfileController');
  try {
    const profile = await profileServices.getProfile(req.params.id as string);
    logger.info('Exit: getProfileController — success');
    res.json(profile);
  } catch (error) {
    logger.error(`Exit: getProfileController — error: ${error}`);
    next(error);
  }
};

const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: updateProfileController');
  try {
    const profile = await profileServices.updateProfile(req.params.id as string, req.body);
    logger.info('Exit: updateProfileController — success');
    res.json(profile);
  } catch (error) {
    logger.error(`Exit: updateProfileController — error: ${error}`);
    next(error);
  }
};

const deleteProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: deleteProfileController');
  try {
    const result = await profileServices.deleteProfile(req.params.id as string);
    logger.info('Exit: deleteProfileController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: deleteProfileController — error: ${error}`);
    next(error);
  }
};

export const resolvePriceController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: resolvePriceController');
  try {
    const result = await profileServices.resolvePrice(req.params.id as string, req.query.customerName as string);
    logger.info('Exit: resolvePriceController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: resolvePriceController — error: ${error}`);
    next(error);
  }
};

export const resolveAllPricesController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: resolveAllPricesController');
  try {
    const results = await profileServices.resolveAllPrices(req.query.customerName as string);
    logger.info('Exit: resolveAllPricesController — success');
    res.json(results);
  } catch (error) {
    logger.error(`Exit: resolveAllPricesController — error: ${error}`);
    next(error);
  }
};

router
  .route('/')
  .post(validateRequest(policies.createProfilePolicy), createProfileController)
  .get(validateRequest(policies.listProfilesPolicy), listProfilesController);

router
  .route('/:id')
  .get(validateRequest(policies.getProfilePolicy), getProfileController)
  .put(validateRequest(policies.updateProfilePolicy), updateProfileController)
  .delete(validateRequest(policies.deleteProfilePolicy), deleteProfileController);

export default router;
