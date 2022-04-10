import fsPromises from 'fs/promises';
import path from 'path';

import config from './config';
import * as fsUtils from './fs-utils';
import * as pageUtils from './page-utils';
import * as photoUtils from './photo-utils';

import type Photo from './types/photo';

const THUMBNAILS_DIRECTORY_NAME = 'thumbnails';
const GENERATED_PAGE = 'index.html';

export const run = async (inputDir: string): Promise<void> => {
  const isValidDirectory = await fsUtils.isDirectory(inputDir);
  if (!isValidDirectory) {
    console.error(`${inputDir} is not a directory.`);
    return;
  }
  const filenames = await fsPromises.readdir(inputDir);
  const photos: Photo[] = [];
  for (const filename of filenames) {
    const photoPath = path.join(inputDir, filename);
    const timestamp = await photoUtils.getCaptureTimestamp(photoPath);
    const basename = path.basename(filename, path.extname(filename));
    const thumbnail = `${basename}.${config.thumbnailFormat}`;
    photos.push({
      path: `${THUMBNAILS_DIRECTORY_NAME}/${thumbnail}`,
      altText: `Photo captured at ${timestamp}.`,
      timestamp
    });
  }
  const thumbnailsDir = path.join(inputDir, THUMBNAILS_DIRECTORY_NAME);
  await fsPromises.mkdir(thumbnailsDir);
  await photoUtils.resizePhotos(inputDir, thumbnailsDir);
  const pagePath = path.join(inputDir, GENERATED_PAGE);
  await pageUtils.generatePage(photos, pagePath);
};
