import childProcess from 'node:child_process';
import path from 'node:path';

import config from '../config';

import type VideoView from '../types/video-view';

const FFPROBE = 'ffprobe';
const FFMPEG = 'ffmpeg';

const NORMAL_EXIT_CODE = 0;
const DEFAULT_CAPTURE_TIMESTAMP = '0001-01-01T00:00:00';
const SKIPPABLE_FORMATS = ['.mp4'];

/**
 * Gets the capture timestamp of the video. If the capture timestamp cannot be
 * found, the default timestamp 0001-01-01T00:00:00 will be used.
 *
 * @param filePath Absolute path of the video.
 *
 * @returns A Promise resolves with the capture timestamp.
 */
const getCaptureTimestamp = (filePath: string): Promise<string> => {
  const commandArguments: string[] = [
    '-loglevel',
    '0',
    '-print_format',
    'json',
    '-show_format',
    filePath,
  ];
  return new Promise((resolve, reject) => {
    const ffprobe = childProcess.spawn(FFPROBE, commandArguments);
    let output = '';
    ffprobe.stdout.on('data', (data: string) => {
      output += data;
    });
    ffprobe.stderr.on('data', (data: Buffer) => {
      console.error(Buffer.from(data).toString('utf8'));
    });
    ffprobe.once('error', (error: Error) => {
      reject(error);
      return;
    });
    ffprobe.once('close', (code: number) => {
      if (code !== NORMAL_EXIT_CODE) {
        console.warn(`ffprobe exited with code ${code} when processing ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const data = JSON.parse(output);
      if (!Object.hasOwn(data, 'format')) {
        console.warn(`Unable to extract capture timestamp of ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      if (!Object.hasOwn(data.format, 'tags')) {
        console.warn(`Unable to extract capture timestamp of ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      if (!Object.hasOwn(data.format.tags, 'creation_time')) {
        console.warn(`Unable to extract capture timestamp of ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const date = new Date(data.format.tags.creation_time);
      // The extracted capture timestamp is invalid.
      if (Number.isNaN(date.getFullYear())) {
        console.warn(`Unable to extract capture timestamp of ${filePath}. Use default timestamp.`);
        resolve(DEFAULT_CAPTURE_TIMESTAMP);
        return;
      }
      const year = `${date.getFullYear()}`.padStart(4, '0');
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const dayOfMonth = `${date.getDate()}`.padStart(2, '0');
      const hour = `${date.getHours()}`.padStart(2, '0');
      const minute = `${date.getMinutes()}`.padStart(2, '0');
      const second = `${date.getSeconds()}`.padStart(2, '0');
      const datePart = `${year}-${month}-${dayOfMonth}`;
      const timePart = `${hour}:${minute}:${second}`
      resolve(`${datePart}T${timePart}`);
    });
  });
};

/**
 * Converts a video file to the configured video format.
 *
 * Several options are added to ensure the encoded video can be played on
 * Safari (macOS and iOS):
 *
 * -pix_fmt yuv420p - The pixel format.
 * -filter:v fps=60 - Set the frame rate to 60 FPS. On iPhone 16 Pro, it is
 *                    possible to record a 4K video at 120 FPS, however it seems
 *                    that Safari (at least on iOS 18.2) doesn't support such
 *                    high frame rate.
 *
 * @param inputPath Path of the video file to be processed.
 * @param outputPath Path of the output file.
 *
 * @returns A Promise resolves without a value.
 */
const convertVideo = async (inputPath: string, outputPath: string): Promise<void> => {
  const commandArgs: string[] = [
    '-i',
    inputPath,
    '-hide_banner',
    '-pix_fmt',
    'yuv420p',
    '-filter:v',
    'fps=60',
    outputPath
  ];
  return new Promise((resolve, reject) => {
    // Some video formats are supported by most browsers and no conversion is
    // needed.
    if (SKIPPABLE_FORMATS.includes(path.extname(inputPath).toLowerCase())) {
      resolve();
      return;
    }

    const ffmpeg = childProcess.spawn(FFMPEG, commandArgs);
    ffmpeg.once('error', (error: Error) => {
      reject(error);
      ffmpeg.kill();
    });
    ffmpeg.once('close', (code: number) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`ffmpeg exit with code ${code} when processing ${inputPath}.`));
        return;
      }
      resolve();
    });
  });
};

/**
 * Processes a video file.
 *
 * @param inputPath Path of the video file to be processed.
 * @param outputPath Path of the output file.
 * @param srcPath Path of output file being referred in the HTML video tag.
 *
 * @returns A Promise resolves with a VideoView object representing the video.
 */
export const process = async (inputPath: string, outputPath: string, srcPath: string): Promise<VideoView> => {
  const timestamp = await getCaptureTimestamp(inputPath);
  await convertVideo(inputPath, outputPath);
  return {
    'video?': {
      width: config.maxWidth,
      height: config.maxHeight,
      path: srcPath,
      timestamp: timestamp
    }
  };
};
