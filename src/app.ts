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

const THUMBNAILS_DIRECTORY_NAME = 'thumbnails';
const GENERATED_PAGE = 'index.html';
const PROCESSOR_MAP = new Map<string, typeof photoProcessor | typeof videoProcessor>([
  ['.jpeg', photoProcessor],
  ['.jpg', photoProcessor],
  ['.png', photoProcessor],
  ['.mp4', videoProcessor],
  ['.mov', videoProcessor]
]);
const WORK_BATCH_SIZE = os.cpus().length;

/**
 * Gets a processor for a given file.
 *
 * @param inputFile Path of file to be processed.
 *
 * @returns The appropriate processor, or null if no processor can be used.
 */
const getProcessor = (inputFile: string): null | typeof photoProcessor | typeof videoProcessor => {
  const extension = path.extname(inputFile).toLocaleLowerCase();
  const processor = PROCESSOR_MAP.get(extension);
  if (processor === undefined) {
    return null;
  }
  return processor;
};

export const run = async (inputDir: string): Promise<void> => {
  const stat = await fsPromises.stat(inputDir);
  if (!stat.isDirectory()) {
    console.error(`${inputDir} is not a directory.`);
    return;
  }

  const thumbnailsDir = path.join(inputDir, THUMBNAILS_DIRECTORY_NAME);
  const filenames = await fsPromises.readdir(inputDir);
  const queue: WorkItem[] = [];
  filenames.forEach(filename => {
    const absPath = path.join(inputDir, filename);
    const processor = getProcessor(filename);
    if (processor === null) {
      console.warn(`No matching processor for ${absPath}, skipping it.`);
      return;
    }
    if (processor === photoProcessor) {
      const originalFile = path.basename(filename, path.extname(filename));
      const outputFile = `${originalFile}.${config.thumbnailFormat}`;
      const outputPath = path.join(thumbnailsDir, outputFile);
      queue.push({
        processor: processor,
        inputPath: absPath,
        outputPath: outputPath,
        srcPath: `${THUMBNAILS_DIRECTORY_NAME}/${outputFile}`
      });
      return;
    }
    if (processor === videoProcessor) {
      const originalFile = path.basename(filename, path.extname(filename));
      const outputFile = `${originalFile}.${config.videoFormat}`;
      const outputPath = path.join(inputDir, outputFile);
      queue.push({
        processor: processor,
        inputPath: absPath,
        outputPath: outputPath,
        srcPath: outputFile
      });
      return;
    }
    // This should never happen.
    console.error(`Missing pre-processing step for ${absPath}, skipping it.`);
  });

  await fsPromises.mkdir(thumbnailsDir);
  const views: MediaView[] = [];
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
        work.processor.process()
          .then((view: MediaView) => {
            views.push(view);
          })
          .catch((error: Error) => {
            console.error(error.message);
          })
          .finally(() => {
            emitter.emit('next');
          });
      });
      emitter.emit('next');
    }));
  }
  await Promise.all(runners);

  const pagePath = path.join(inputDir, GENERATED_PAGE);
  await pageUtils.generatePage(views, pagePath);
};
