import EventEmitter from 'node:events';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import config from './config';
import * as pageUtils from './page-utils';
import * as photoProcessor from './processors/photo-processor';
import * as videoProcessor from './processors/video-processor';

import type MediaView from './types/media-view';
import type WorkItem from './types/work-item';
import type WorkResult from './types/work-result';

const THUMBNAILS_DIRECTORY_NAME = 'thumbnails';
const GENERATED_PAGE = 'index.html';
const PHOTO_TYPES = ['.jpeg', '.jpg', '.png', '.heic'];
const VIDEO_TYPES = ['.mp4', '.mov'];
const WORK_BATCH_SIZE = os.cpus().length;

/**
 * Process photos.
 *
 * Multiple photos may be processed at the same time.
 *
 * @param queue Work queue.
 *
 * @returns A Promise resolves with work results.
 */
const processPhotos = async (queue: WorkItem[]): Promise<WorkResult[]> => {
  const workResults: WorkResult[] = [];
  const runners = [];
  for (let i = 0; i < WORK_BATCH_SIZE; i += 1) {
    runners.push(new Promise((resolve, reject) => {
      const emitter = new EventEmitter();
      emitter.on('next', () => {
        const work = queue.shift();
        if (work === undefined) {
          resolve(true);
          return;
        }
        photoProcessor.process(work.inputPath, work.outputPath, work.srcPath)
          .then((view: MediaView) => {
            workResults.push({
              inputPath: work.inputPath,
              view: view
            });
          })
          .catch((error: Error) => {
            reject(error);
          })
          .finally(() => {
            emitter.emit('next');
          });
      });
      emitter.emit('next');
    }));
  }
  await Promise.all(runners);
  return workResults;
};

/**
 * Process videos.
 *
 * A video is being processed each time.
 *
 * @param queue Work queue.
 *
 * @returns A Promise resolves with work results.
 */
const processVideos = async (queue: WorkItem[]): Promise<WorkResult[]> => {
  return new Promise((resolve, reject) => {
    const workResults: WorkResult[] = [];
    const emitter = new EventEmitter();
    emitter.on('next', () => {
      const work = queue.shift();
      if (work === undefined) {
        resolve(workResults);
        return;
      }
      videoProcessor.process(work.inputPath, work.outputPath, work.srcPath)
        .then((view: MediaView) => {
          workResults.push({
            inputPath: work.inputPath,
            view: view
          });
        })
        .catch((error: Error) => {
          reject(error);
        })
        .finally(() => {
          emitter.emit('next');
        });
    });
    emitter.emit('next');
  });
};

export const run = async (inputDir: string): Promise<void> => {
  const stat = await fsPromises.stat(inputDir);
  if (!stat.isDirectory()) {
    console.error(`${inputDir} is not a directory.`);
    return;
  }

  const thumbnailsDir = path.join(inputDir, THUMBNAILS_DIRECTORY_NAME);
  const filenames = await fsPromises.readdir(inputDir);
  const photosQueue: WorkItem[] = [];
  const videosQueue: WorkItem[] = [];
  filenames.forEach(filename => {
    const absPath = path.join(inputDir, filename);
    const originalFile = path.basename(filename, path.extname(filename));
    const fileExtension = path.extname(filename).toLowerCase();

    if (PHOTO_TYPES.includes(fileExtension)) {
      const outputFile = `${originalFile}.${config.thumbnailFormat}`;
      const outputPath = path.join(thumbnailsDir, outputFile);
      photosQueue.push({
        inputPath: absPath,
        outputPath: outputPath,
        srcPath: `${THUMBNAILS_DIRECTORY_NAME}/${outputFile}`
      });
      return;
    }

    if (VIDEO_TYPES.includes(fileExtension)) {
      const outputFile = `${originalFile}.${config.videoFormat}`;
      const outputPath = path.join(inputDir, outputFile);
      videosQueue.push({
        inputPath: absPath,
        outputPath: outputPath,
        srcPath: outputFile
      });
      return;
    }

    console.warn(`No matching processor for ${absPath}, skipping it.`);
  });

  await fsPromises.mkdir(thumbnailsDir);
  const photoWorkResults = await processPhotos(photosQueue);
  const videoWorkResults = await processVideos(videosQueue);
  const workResults: WorkResult[] = [...photoWorkResults, ...videoWorkResults];

  const views: MediaView[] = workResults.sort((resultA, resultB) => {
      return resultA.inputPath.localeCompare(resultB.inputPath);
    })
    .map((result) => {
      return result.view;
    });

  const pagePath = path.join(inputDir, GENERATED_PAGE);
  await pageUtils.generatePage(views, pagePath);
};
