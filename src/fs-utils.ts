import fsPromises from 'fs/promises';

/**
 * Checks if the given path is a directory.
 *
 * @param directory Directory path.
 *
 * @returns A Promise resolves with true if the path is a directory, or resolves
 *          with false if the path is not a directory.
 */
export const isDirectory = async (directory: string): Promise<boolean> => {
  const stat = await fsPromises.stat(directory);
  return stat.isDirectory();
};
