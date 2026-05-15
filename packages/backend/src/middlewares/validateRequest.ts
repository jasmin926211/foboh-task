import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestException } from '../utilities/exceptions';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        schemas.query.parse({ ...req.query });
      }
      if (schemas.params) {
        schemas.params.parse({ ...req.params });
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        next(new BadRequestException(message));
      } else {
        next(new BadRequestException('Validation failed'));
      }
    }
  };
};

export default validateRequest;
