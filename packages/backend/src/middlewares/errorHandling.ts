import { Request, Response, NextFunction } from 'express';
import logger from '../utilities/logger';

interface AppError {
  statusCode: number;
  title: string;
  description?: string;
  products?: unknown;
}

const isAppError = (err: unknown): err is AppError =>
  typeof err === 'object' &&
  err !== null &&
  'statusCode' in err &&
  'title' in err &&
  typeof (err as AppError).statusCode === 'number' &&
  typeof (err as AppError).title === 'string';

const errorHandling = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isAppError(err)) {
    logger.error(`Handled error: ${err.title} - ${err.description}`);
    res.status(err.statusCode).json({
      error: {
        title: err.title,
        description: err.description,
        ...('products' in err && err.products ? { products: err.products } : {}),
      },
    });
    return;
  }

  const message = err instanceof Error ? err.stack || err.message : String(err);
  logger.error(`Unhandled error: ${message}`);
  res.status(500).json({
    error: {
      title: 'Internal server error',
      description: 'Something went wrong',
    },
  });
};

export default errorHandling;
