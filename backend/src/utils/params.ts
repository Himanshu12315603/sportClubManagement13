import { Request } from 'express';

export const getParam = (req: Request, key = 'id'): string => {
  const val = req.params[key];
  if (Array.isArray(val)) return val[0];
  return (val as string) || '';
};
