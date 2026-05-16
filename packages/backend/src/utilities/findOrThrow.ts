import { ResourceNotFoundException } from './exceptions';

const findOrThrow = async <T>(
  query: Promise<T | null>,
  entityName: string,
  id: string,
): Promise<T> => {
  const result = await query;
  if (!result) {
    throw new ResourceNotFoundException(`${entityName} with id ${id} not found`);
  }
  return result;
};

export default findOrThrow;
