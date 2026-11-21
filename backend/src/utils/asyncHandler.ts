import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler so errors are forwarded to Express error middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
