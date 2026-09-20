import { Request, Response, NextFunction } from 'express';

export const validateRequest = () => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // Request validation middleware stub for future schema validation
    next();
  };
};
