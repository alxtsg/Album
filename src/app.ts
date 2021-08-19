import path from 'path';

import config from './config';
import * as fsUtils from './fs-utils';
import * as pageUtils from './page-utils';
import Photo from './types/photo';
import * as photoUtils from './photo-utils';

const THUMBNAILS_DIRECTORY_NAME: string = 'thumbnails';
const GENERATED_PAGE: string = 'index.html';

export const run = async (inputDir: string): Promise<void> => {
  const isValidDirectory: boolean = await fsUtils.isDirectory(inputDir);
  if (!isValidDirectory) {
    console.error(`${inputDir} is not a directory.`);
    return;
  }
  const filenames: string[] = await fsUtils.getFilenames(inputDir);
  const photos: Photo[] = [];
  for (const filename of filenames) {
    const photoPath: string = path.join(inputDir, filename);
    const timestamp: string = await photoUtils.getCaptureTimestamp(photoPath);
    const basename: string = path.basename(filename, path.extname(filename));
    const thumbnail: string = `${basename}.${config.thumbnailFormat}`;
    photos.push({
      path: `${THUMBNAILS_DIRECTORY_NAME}/${thumbnail}`,
      altText: `Photo captured at ${timestamp}.`,
      timestamp
    });
  }
  const thumbnailsDir = path.join(inputDir, THUMBNAILS_DIRECTORY_NAME);
  await fsUtils.createDirectory(thumbnailsDir);
  await photoUtils.resizePhotos(inputDir, thumbnailsDir);
  const pagePath: string = path.join(inputDir, GENERATED_PAGE);
  await pageUtils.generatePage(photos, pagePath);
};
