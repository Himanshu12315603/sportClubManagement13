import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';

const handleCastError = (err: mongoose.Error.CastError) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err: { keyValue?: Record<string, unknown> }) => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'Resource';
  return new AppError(`${field} already exists`, 409);
};

const handleValidationError = (err: mongoose.Error.ValidationError) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleZodError = (err: ZodError) => {
  const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  ) {
    error = handleDuplicateKeyError(err as unknown as { keyValue?: Record<string, unknown> });
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'JsonWebTokenError'
  ) {
    error = handleJWTError();
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'TokenExpiredError'
  ) {
    error = handleJWTExpiredError();
  } else {
    console.error('💥 Unhandled error:', err);
    error = new AppError('Something went wrong. Please try again later.', 500);
  }

  const isDev = process.env.NODE_ENV === 'development';

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(isDev && { stack: (err instanceof Error ? err.stack : undefined) }),
  });
};
