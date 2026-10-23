import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 4 no captura promesas rechazadas; sin esto, un error
 * lanzado en un controller async mata el proceso (rechazo no atrapado).
 */
export function asyncHandler(fn: AsyncFn): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
