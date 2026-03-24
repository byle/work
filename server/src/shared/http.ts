import { Response } from 'express';

export function success<T>(res: Response, data: T, message = 'success') {
  return res.json({
    code: 0,
    message,
    data
  });
}

export function failure(res: Response, message: string, code = 5000, status = 500) {
  return res.status(status).json({
    code,
    message,
    data: null
  });
}
