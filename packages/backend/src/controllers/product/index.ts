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

const updateProductController = wrapController('updateProductController', async (req) => ({
  data: await productServices.updateProduct(req.params.id as string, req.body),
}));

const deleteProductController = wrapController('deleteProductController', async (req) => ({
  data: await productServices.deleteProduct(req.params.id as string),
}));

router.get('/', validateRequest(policies.listProductsPolicy), listProductsController);
router.get('/:id', validateRequest(policies.getProductPolicy), getProductController);
router.put('/:id', validateRequest(policies.updateProductPolicy), updateProductController);
router.delete('/:id', validateRequest(policies.deleteProductPolicy), deleteProductController);

export default router;
