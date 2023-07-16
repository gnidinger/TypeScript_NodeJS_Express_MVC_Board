import { Request } from 'express';

export interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
  };
}
