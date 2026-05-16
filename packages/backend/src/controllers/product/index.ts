import { Router } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/product';
import * as productServices from '../../services/product';
import wrapController from '../../utilities/controllerWrapper';

const router = Router();

const listProductsController = wrapController('listProductsController', async (req) => ({
  data: await productServices.listProducts(req.query),
}));

const getProductController = wrapController('getProductController', async (req) => ({
  data: await productServices.getProduct(req.params.id as string),
}));

router.get('/', validateRequest(policies.listProductsPolicy), listProductsController);
router.get('/:id', validateRequest(policies.getProductPolicy), getProductController);

export default router;
