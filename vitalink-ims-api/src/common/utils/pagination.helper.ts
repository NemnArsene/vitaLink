import { Model, Document, FilterQuery, QueryOptions } from 'mongoose';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

export async function paginate<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  pagination: PaginationDto,
  options?: QueryOptions,
): Promise<PaginatedResult<T>> {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const skip = (page - 1) * limit;

  const sort: Record<string, 1 | -1> = {};
  if (pagination.sortBy) {
    sort[pagination.sortBy] = pagination.sortOrder === 'asc' ? 1 : -1;
  }

  const [data, total] = await Promise.all([
    model.find(filter, null, { ...options, skip, limit, sort: Object.keys(sort).length ? sort : undefined }).exec(),
    model.countDocuments(filter).exec(),
  ]);

  return new PaginatedResult(data, total, page, limit);
}
