import { Router } from 'express';
import productRouter from './product';
import pricingProfileRouter, { resolveAllPricesController, previewPricesController } from './pricingProfile';
import customerRouter from './customer';
import customerGroupRouter from './customerGroup';
import { validateRequest } from '../middlewares';
import { resolvedPricesPolicy, previewPricesPolicy } from '../policies/pricingProfile';

const router = Router();

router.use('/products', productRouter);
router.use('/pricing-profiles', pricingProfileRouter);
router.use('/customers', customerRouter);
router.use('/customer-groups', customerGroupRouter);

router.get(
  '/resolved-prices',
  validateRequest(resolvedPricesPolicy),
  resolveAllPricesController
);

router.post(
  '/preview-prices',
  validateRequest(previewPricesPolicy),
  previewPricesController
);

export default router;
