import childProcess from 'child_process';
import path from 'path';

import config from './config';
import * as fsUtils from './fs-utils';

const NORMAL_EXIT_CODE: number = 0;
const TIMESTAMP_REGEX: RegExp = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
const DEFAULT_CAPTURE_TIMESTAMP = '0001-01-01T00:00:00';

/**
 * Gets the capture timestamp of the photo. If the capture timestamp cannot be
 * found, the default timestamp 0001-01-01T00:00:00 will be used.
 *
 * @param photoPath Absolute path of the photo.
 *
 * @returns A Promise resolves with the capture timestamp.
 */
export const getCaptureTimestamp = (photoPath: string): Promise<string> => {
  const commandArguments: string[] = [
    'identify',
    '-format',
    "'%[EXIF:DateTimeOriginal]'",
    photoPath
  ];
  return new Promise((resolve, reject) => {
    const gm = childProcess.spawn(config.gmPath, commandArguments);
    let output: string = '';
    gm.stdout.on('data', (data: string) => {
      output += data;
    });
    gm.stderr.on('data', (data: string) => {
      console.error(data);
    });
    gm.once('error', (error: Error) => {
      reject(error);
      return;
    });
    gm.once('close', (code: number) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`GraphicsMagick exited with code ${code}.`));
        return;
      }
      // The expected format of extracted photo capture time reported by
      // GraphicsMagick is YYYY:MM:DD HH:mm:ss, if the format does not match,
      // return the default timestamp.
      if (!TIMESTAMP_REGEX.test(output)) {
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const matchArray: RegExpMatchArray | null = output.match(TIMESTAMP_REGEX);
      if (matchArray === null) {
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const [
        timestamp,
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
 * Resizes the given photos.
 *
 * @param inputDir Absolute path of the input directory.
 * @param outputDir Absolute path of the output directory.
 *
 * @returns A Promise resolves without a value.
 */
export const resizePhotos = async (inputDir: string, outputDir: string): Promise<void> => {
  const filenames = await fsUtils.getFilenames(inputDir);
  const resizeCommands: string[] = filenames.map((filename: string) => {
    const originalPath = path.join(inputDir, filename);
    const thumbnailPath = path.join(outputDir, filename);
    return [
      'convert',
      '-auto-orient',
      '-geometry',
      `${config.maxWidth}x${config.maxHeight}`,
      '-strip',
      originalPath,
      thumbnailPath,
      '\n'
    ].join(' ');
  });
  return new Promise((resolve, reject) => {
    const gmCommandArguments: string[] = [
      'batch',
      '-'
    ];
    const gm = childProcess.spawn(config.gmPath, gmCommandArguments);
    gm.once('error', (error: Error) => {
      reject(error);
      gm.kill();
    });
    gm.once('close', (code: number) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`GraphicsMagick exit with code ${code}.`));
        return;
      }
      resolve();
    });
    gm.stdin.write(resizeCommands.join(''));
    gm.stdin.end();
  });
};
