import { Request, Response, NextFunction } from 'express';
import logger from '../utilities/logger';

const errorHandling = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.statusCode && err.title) {
    logger.error(`Handled error: ${err.title} - ${err.description}`);
    res.status(err.statusCode).json({
      error: {
        title: err.title,
        description: err.description,
      },
    });
    return;
  }

  logger.error(`Unhandled error: ${err.stack || err.message || err}`);
  res.status(500).json({
    error: {
      title: 'Internal server error',
      description: 'Something went wrong',
    },
  });
};

export default errorHandling;
