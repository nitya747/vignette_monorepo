import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';
import { ValidationError } from './errorHandler.js';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.format();
      console.warn('[Validation Error] Payload:', req.body, 'Errors:', JSON.stringify(formattedErrors, null, 2));
      next(new ValidationError(formattedErrors, 'Request validation failed'));
      return;
    }
    // Store validated data in req.body or a dedicated property
    next();
  };
};
