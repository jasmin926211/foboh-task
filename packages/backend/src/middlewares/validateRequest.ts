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
        const parsed = schemas.query.parse({ ...req.query });
        // req.query is read-only in Express 5 / newer router -mutate in place
        const query = req.query;
        for (const key of Object.keys(query)) {
          delete query[key];
        }
        Object.assign(query, parsed);
      }
      if (schemas.params) {
        const parsed = schemas.params.parse({ ...req.params });
        const params = req.params;
        for (const key of Object.keys(params)) {
          delete params[key];
        }
        Object.assign(params, parsed);
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new BadRequestException(message));
      } else {
        next(new BadRequestException('Validation failed'));
      }
    }
  };
};

export default validateRequest;
