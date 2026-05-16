import { Router } from 'express';
import productRouter from './product';
import pricingProfileRouter, { resolvePriceController, resolveAllPricesController, previewPricesController, resolveSinglePriceController } from './pricingProfile';
import customerRouter from './customer';
import customerGroupRouter from './customerGroup';
import { validateRequest } from '../middlewares';
import { resolvedPricesPolicy, resolvedPriceByProductPolicy, previewPricesPolicy, resolvePricePolicy } from '../policies/pricingProfile';

const router = Router();

router.use('/products', productRouter);
router.use('/pricing-profiles', pricingProfileRouter);
router.use('/customers', customerRouter);
router.use('/customer-groups', customerGroupRouter);

router.get(
  '/products/:id/resolved-price',
  validateRequest(resolvedPriceByProductPolicy),
  resolvePriceController
);

router.get(
  '/resolved-prices',
  validateRequest(resolvedPricesPolicy),
  resolveAllPricesController
);

router.get(
  '/resolve-price',
  validateRequest(resolvePricePolicy),
  resolveSinglePriceController
);

router.post(
  '/preview-prices',
  validateRequest(previewPricesPolicy),
  previewPricesController
);

export default router;
