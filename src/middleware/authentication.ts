import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.locals.user = await User.findOne({ userSeq: (decoded as any).userSeq }).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized, Token Failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized, No Token' });
    return;
  }
});

export { authMiddleware };
