import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorMiddleware';


export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new AppError('Not authorized as admin', 403);
  }
};


export const vendor = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    next();
  } else {
    throw new AppError('Not authorized as vendor', 403);
  }
};


export const vendorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor')) {
    next();
  } else {
    throw new AppError('Not authorized', 403);
  }
};