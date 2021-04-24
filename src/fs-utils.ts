import fs from 'fs';

/**
 * Checks if the given path is a directory.
 *
 * @param directory Directory path.
 *
 * @returns A Promise resolves with true if the path is a directory, or resolves
 *          with false if the path is not a directory.
 */
export const isDirectory = (directory: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fs.stat(directory, (error, stats) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(stats.isDirectory());
    });
  });
};

/**
 * Gets names of files under the given directory.
 *
 * @param directory Directory path.
 *
 * @returns A Promise resolves with an array of filenames.
 */
 export const getPhotoFilenames = (directory: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (error, filenames) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(filenames);
    });
  });
};


/**
 * Gets file content.
 *
 * @param file File path.
 *
 * @returns A Promise resolves with the file content as string.
 */
export const getFileContent = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      file,
      {
        encoding: 'utf8'
      },
      (error, data) => {
        if (error !== null) {
          reject(error);
          return;
        }
        resolve(data);
      }
    );
  });
};

/**
 * Writes file content.
 *
 * @param file Destination file path.
 * @param content File content.
 *
 * @returns A Promise resolves without a value.
 */
export const writeFile = (file: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, content, (error) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
