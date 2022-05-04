import { PaginatedResult } from '../types';
import { Model, FilterQuery } from 'mongoose';

export const paginate = (sourceData: any[], page: number, limit: number): PaginatedResult<any> => {
  const totalDocuments = sourceData.length;
  const totalPages = Math.ceil(totalDocuments / limit);
  const currentPage = page;
  const nextPage = page + 1 <= totalPages ? page + 1 : null;
  const prevPage = page - 1 > 0 ? page - 1 : null;

  const start = (page - 1) * limit;
  const end = limit * page;

  const data = sourceData.slice(start, end);

  return {
    totalDocuments,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
    data,
  };
};

export default paginate;

export const mongoosePaginate = async <T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  page: number,
  limit: number,
  sort?: any,
  populate?: string[]
): Promise<PaginatedResult<T>> => {
  const totalDocuments = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalDocuments / limit);
  const currentPage = page;
  const nextPage = page + 1 <= totalPages ? page + 1 : null;
  const prevPage = page - 1 > 0 ? page - 1 : null;

  let query = model.find(filter);

  if (sort) {
    query = query.sort(sort);
  }
  if (populate) {
    populate.forEach((val) => {
      query.populate(val);
    });
  }

  const data = await query.skip((page - 1) * limit).limit(limit);

  return {
    totalDocuments,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
    data,
  };
};
