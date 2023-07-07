import { Response } from 'express';

export default function sendErrorResponse(res: Response, statusCode: number, message: string) {
  res.status(statusCode).json({ error: message });
}
