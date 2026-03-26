export const runConcurrently = async <T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency).map((task) => task());
    const chunkResults = await Promise.all(chunk);
    results.push(...chunkResults);
  }

  return results;
};
