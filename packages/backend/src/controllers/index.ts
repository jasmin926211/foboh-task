import { Router } from 'express';
import productRouter from './product';
import pricingProfileRouter, { resolvePriceController, resolveAllPricesController } from './pricingProfile';
import { validateRequest } from '../middlewares';
import { resolvedPricesPolicy, resolvedPriceByProductPolicy } from '../policies/pricingProfile';

const router = Router();

router.use('/products', productRouter);
router.use('/pricing-profiles', pricingProfileRouter);

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

export default router;
