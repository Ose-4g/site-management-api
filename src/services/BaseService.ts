import { Model, model } from 'mongoose';

import AppError from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import validator from 'validator';

export class BaseService {
  async checkDocumentExists<T>(
    model: Model<T>,
    documentId: string,
    modelName: string,
    options?: { select?: string; populate?: string[] }
  ): Promise<T> {
    if (!validator.isMongoId(documentId)) {
      throw new AppError('Invalid id provided', StatusCodes.BAD_REQUEST);
    }

    let query = model.findById(documentId);
    if (options?.populate) {
      for (const field of options.populate) {
        query = query.populate(field) as typeof query;
      }
    }
    if (options?.select) {
      query = query.select(options.select);
    }

    const doc = await query;
    if (!doc) {
      throw new AppError(`${modelName} deos not exist`, StatusCodes.NOT_FOUND);
    }

    return doc;
  }
}
