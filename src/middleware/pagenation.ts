import { Request, Response, NextFunction } from 'express';
import sendErrorResponse from '../utils/sendErrorResponse';

export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);

  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1 || 100 < limit) {
    sendErrorResponse(res, 400, '페이지네이션 파라미터가 잘못되었습니다.');
    return;
  }

  next();
};
