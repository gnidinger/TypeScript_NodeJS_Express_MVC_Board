import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      console.log(decoded);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.locals.user = await User.findOne({ userSeq: (decoded as any).userSeq }).select('-password');
      console.log(res.locals.user.userSeq);

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
