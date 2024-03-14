import childProcess from 'child_process';

import config from '../config';

import type PhotoView from '../types/photo-view';

const MAGICK = 'magick';

const NORMAL_EXIT_CODE = 0;
const TIMESTAMP_REGEX = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
const DEFAULT_CAPTURE_TIMESTAMP = '0001-01-01T00:00:00';

/**
 * Gets the capture timestamp of the photo. If the capture timestamp cannot be
 * found, the default timestamp 0001-01-01T00:00:00 will be used.
 *
 * @param filePath Absolute path of the photo.
 *
 * @returns A Promise resolves with the capture timestamp.
 */
const getCaptureTimestamp = (filePath: string): Promise<string> => {
  const commandArguments: string[] = [
    'identify',
    '-format',
    "'%[EXIF:DateTimeOriginal]'",
    filePath
  ];
  return new Promise((resolve, reject) => {
    const im = childProcess.spawn(MAGICK, commandArguments);
    let output = '';
    im.stdout.on('data', (data: string) => {
      output += data;
    });
    im.stderr.on('data', (data: Buffer) => {
      console.error(Buffer.from(data).toString('utf8'));
    });
    im.once('error', (error: Error) => {
      reject(error);
      return;
    });
    im.once('close', (code: number) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`ImageMagick (identify) exited with code ${code} when processing ${filePath}.`));
        return;
      }
      // The expected format of extracted photo capture time is
      // YYYY:MM:DD HH:mm:ss, if the format does not match, return the default
      // timestamp.
      if (!TIMESTAMP_REGEX.test(output)) {
        console.warn(`Unable to extract capture timestamp of ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const matchArray: RegExpMatchArray | null = output.match(TIMESTAMP_REGEX);
      if (matchArray === null) {
        console.warn(`Unable to extract capture timestamp of ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const [
        _,
        year,
        month,
        dayOfMonth,
        hour,
        minute,
        second
      ]: string[] = matchArray;
      const datePart = `${year}-${month}-${dayOfMonth}`;
      const timePart = `${hour}:${minute}:${second}`
      resolve(`${datePart}T${timePart}`);
    });
  });
};

/**
 * Resizes a photo.
 *
 * @param inputPath Path of the photo file to be resized.
 * @param outputPath Path of the resized file.
 *
 * @returns A Promise resolves without a value.
 */
const resizePhoto = async (inputPath: string, outputPath: string): Promise<void> => {
  const commandArgs: string[] = [
    inputPath,
    '-auto-orient',
    '-geometry',
    `${config.maxWidth}x${config.maxHeight}`,
    '-strip',
    outputPath
  ];
  return new Promise((resolve, reject) => {
    const im = childProcess.spawn(MAGICK, commandArgs);
    im.once('error', (error: Error) => {
      reject(error);
      im.kill();
    });
    im.once('close', (code: number) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`ImageMagick (mogrify) exit with code ${code} when processing ${inputPath}.`));
        return;
      }
      resolve();
    });
  });
};

/**
 * Processes a photo file.
 *
 * @param inputPath Path of the photo file to be processed.
 * @param outputPath Path of the output file.
 * @param srcPath Path of output file being referred in the HTML img tag.
 *
 * @returns A Promise resolves with a PhotoView object representing the photo.
 */
export const process = async (inputPath: string, outputPath: string, srcPath: string): Promise<PhotoView> => {
  const timestamp = await getCaptureTimestamp(inputPath);
  await resizePhoto(inputPath, outputPath);
  return {
    'photo?': {
      path: srcPath,
      timestamp: timestamp
    }
  };
};
