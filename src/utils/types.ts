import { Request } from 'express';
import { Session } from '../dtos';

export interface PaginatedResult<T> {
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  data: T[];
}

export interface TimeStamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequest extends Request {
  session: Session;
}
