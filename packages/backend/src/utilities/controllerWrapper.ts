import { Request, Response, NextFunction } from 'express';
import logger from './logger';

type ControllerResult = { status?: number; data: unknown };
type ControllerHandler = (req: Request) => Promise<ControllerResult>;

const wrapController = (name: string, handler: ControllerHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Entry: ${name}`);
    try {
      const { status = 200, data } = await handler(req);
      logger.info(`Exit: ${name} - success`);
      res.status(status).json(data);
    } catch (error) {
      logger.error(`Exit: ${name} - error: ${error}`);
      next(error);
    }
  };
};

export default wrapController;
