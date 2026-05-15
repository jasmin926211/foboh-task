import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/product';
import * as productServices from '../../services/product';
import logger from '../../utilities/logger';

const router = Router();

const listProductsController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: listProductsController');
  try {
    const products = await productServices.listProducts(req.query as any);
    logger.info('Exit: listProductsController — success');
    res.json(products);
  } catch (error) {
    logger.error(`Exit: listProductsController — error: ${error}`);
    next(error);
  }
};

const getProductController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: getProductController');
  try {
    const product = await productServices.getProduct(req.params.id as string);
    logger.info('Exit: getProductController — success');
    res.json(product);
  } catch (error) {
    logger.error(`Exit: getProductController — error: ${error}`);
    next(error);
  }
};

router.get('/', validateRequest(policies.listProductsPolicy), listProductsController);
router.get('/:id', validateRequest(policies.getProductPolicy), getProductController);

export default router;
