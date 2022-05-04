export const batchPromises = async (batchSize: number, promises: Promise<unknown>[]): Promise<any[]> => {
  if (batchSize <= 0) throw new Error('batch size should be greater than 0');
  if (batchSize > 100) throw new Error('batch size cannot be greater than 100');
  let result: any[] = [];

  let start = 0;
  const n = promises.length;

  while (start < n) {
    const batchResult = await Promise.all(promises.slice(start, start + batchSize));
    result = result.concat(batchResult);
    start += batchSize;
  }
  return result;
};
