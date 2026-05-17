import { Router } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/pricingProfile';
import * as profileServices from '../../services/pricingProfile';
import wrapController from '../../utilities/controllerWrapper';
import { PAGINATION } from '../../constants';

const router = Router();

const createProfileController = wrapController('createProfileController', async (req) => ({
  status: 201,
  data: await profileServices.createProfile(req.body),
}));

const listProfilesController = wrapController('listProfilesController', async (req) => ({
  data: await profileServices.listProfiles(
    req.query.search as string | undefined,
    req.query.status as 'draft' | 'published' | undefined,
    Number(req.query.page) || PAGINATION.DEFAULT_PAGE,
    Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
  ),
}));

const getProfileController = wrapController('getProfileController', async (req) => ({
  data: await profileServices.getProfile(req.params.id as string),
}));

const updateProfileController = wrapController('updateProfileController', async (req) => ({
  data: await profileServices.updateProfile(req.params.id as string, req.body),
}));

const deleteProfileController = wrapController('deleteProfileController', async (req) => ({
  data: await profileServices.deleteProfile(req.params.id as string),
}));

export const resolveAllPricesController = wrapController('resolveAllPricesController', async (req) => ({
  data: await profileServices.resolveAllPrices(req.query.customerId as string),
}));

export const previewPricesController = wrapController('previewPricesController', async (req) => ({
  data: await profileServices.previewPrices(req.body),
}));

const checkNameController = wrapController('checkNameController', async (req) => ({
  data: { exists: await profileServices.checkProfileNameExists(
    req.query.name as string,
    req.query.excludeId as string | undefined,
  )},
}));

router
  .route('/')
  .post(validateRequest(policies.createProfilePolicy), createProfileController)
  .get(validateRequest(policies.listProfilesPolicy), listProfilesController);

router
  .route('/check-name')
  .get(checkNameController);

router
  .route('/:id')
  .get(validateRequest(policies.getProfilePolicy), getProfileController)
  .put(validateRequest(policies.updateProfilePolicy), updateProfileController)
  .delete(validateRequest(policies.deleteProfilePolicy), deleteProfileController);

export default router;
