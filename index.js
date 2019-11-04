/**
 * Static album page generation tool.
 *
 * @author Alex TSANG <alextsang@live.com>
 *
 * @license BSD-3-Clause
 */

'use strict';

/**
 * @typedef {import('./type-def').Config} Config
 * @typedef {import('./type-def').Photo} Photo
 */

const mustache = require('mustache');

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const config = require('./config');

const templatePath = path.join(
  __dirname,
  'template.mustache'
);

const EXPECTED_ARG_LENGTH = 3;
const NORMAL_EXIT_CODE = 0;
const MOD_TIME_REGEX = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
const DEFAULT_MOD_TIME = '0001-01-01T00:00:00';

/**
 * Prints program usage.
 */
const usage = () => {
  const scriptPath = process.argv[1];
  console.error(`Usage: node ${scriptPath} <input-dir>`);
};

/**
 * Checks if the given path is a directory.
 *
 * @param {string} directory Directory path.
 *
 * @returns {Promise<boolean>} Resolves with a boolean value which indicates
 *                             whether the path is a directory, or rejects with
 *                             an Error.
 */
const isDirectory = (directory) => {
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
 * Gets file content.
 *
 * @param {string} file File path.
 *
 * @returns {Promise<string>} Resolves with the file content, or rejects with an
 *                            Error.
 */
const getFileContent = (file) => {
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
 * @param {string} file Destination file path.
 * @param {string} content File content.
 *
 * @returns {Promise} Resolves without a value, or rejects with an Error.
 */
const writeFile = (file, content) => {
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

/**
 * Gets filenames of photos from the given directory.
 *
 * @returns {Promise<Photo[]>} Resolves with an array of photo data, or rejects
 *                             with an Error object.
 */
const getPhotos = (directory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (error, filenames) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(filenames.map((filename) => {
        return {
          filename,
          path: path.join(directory, filename)
        };
      }));
    });
  });
};

/**
 * Sets modification time of a photo.
 *
 * If the modification time cannot be retrieved, the default timestamp
 * 0001-01-01T00:00:00 will be set.
 *
 * @param {Config} config Configurations.
 * @param {Photo} photo Photo data.
 *
 * @returns {Promise} Resolves without a value, or rejects with an Error.
 */
const setPhotoModTime = async (config, photo) => {
  const commandArguments = [
    'identify',
    '-format',
    "'%[EXIF:DateTimeOriginal]'",
    photo.path
  ];
  return new Promise((resolve, reject) => {
    const gm = childProcess.spawn(config.gmPath, commandArguments);
    let output = '';
    gm.stdout.on('data', (data) => {
      output += data;
    });
    gm.stderr.on('data', (data) => {
      console.error(data);
    });
    gm.on('error', (error) => {
      reject(error);
      return;
    });
    gm.on('close', (code) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`GraphicsMagick exited with code ${code}.`));
        return;
      }
      // The expected format of extracted modification time reported by
      // GraphicsMagick is:
      // YYYY:MM:DD HH:mm:ss
      if (!MOD_TIME_REGEX.test(output)) {
        photo.modTime = DEFAULT_MOD_TIME;
        resolve();
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
      ] = output.match(MOD_TIME_REGEX);
      const datePart = `${year}-${month}-${dayOfMonth}`;
      const timePart = `${hour}:${minute}:${second}`
      photo.modTime = `${datePart}T${timePart}`;
      resolve();
    });
  });
};

/**
 * Creates thumbnails directory.
 *
 * @param {string} directory Path of thumbnails directory.
 *
 * @returns {Promise} Resolves without a value, or rejects with an Error object.
 */
const createThumbnailsDirectory = (directory) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(directory, (error) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

/**
 * Resizes photos in batch.
 *
 * @param {Config} config Program configurations.
 * @param {Photo[]} photos An array of photo data.
 * @param {string} thumbnailsDirectory Thumbnails directory.
 *
 * @returns {Promise} Resolves without a value, or rejects with an Error object.
 */
const batchResize = (config, photos, thumbnailsDirectory) => {
  return new Promise((resolve, reject) => {
    const commandArguments = [
      'batch',
      '-'
    ];
    const gm = childProcess.spawn(config.gmPath, commandArguments);
    gm.on('error', (error) => {
      reject(error);
      gm.kill();
    });
    gm.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`GraphicsMagick exit with code ${code}.`));
        return;
      }
      resolve();
    });
    const batchCommands = photos.map((photo) => {
      const thumbnailPath = path.join(thumbnailsDirectory, photo.filename);
      const command = [
        'convert',
        '-auto-orient',
        '-geometry',
        '1280x720>',
        '-strip',
        photo.path,
        thumbnailPath,
        '\n'
      ].join(' ');
      return command;
    });
    gm.stdin.write(batchCommands.join(''));
    gm.stdin.end();
  });
};

/**
 * Generates a page (HTML document) using the photos.
 *
 * @async
 *
 * @param {string} template Page template path.
 * @param {Photo[]} photos An array of photo data.
 * @param {string} page Generated path path.
 *
 * @returns {Promise} Resolves without a value, or rejects with an Error object.
 */
const generatePage = async (template, photos, page) => {
  try {
    const templateContent = await getFileContent(template);
    const view = {
      currentTimestamp: (new Date()).toISOString(),
      photos: photos.map((photo) => {
        return {
          filename: photo.filename,
          altText: `Photo captured at ${photo.modTime}.`,
          timestamp: photo.modTime
        };
      })
    };
    const generatedContent = mustache.render(templateContent, view);
    await writeFile(page, generatedContent);
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  if (process.argv.length !== EXPECTED_ARG_LENGTH) {
    usage();
    return;
  }
  const inputDirectory = process.argv[2];
  try {
    const isValidDirectory = await isDirectory(inputDirectory)
    if (!isValidDirectory) {
      console.error(`${inputDirectory} is not a directory.`);
      return;
    }
    const photos = await getPhotos(inputDirectory);
    const tasks = photos.map((photo) => {
      return setPhotoModTime(config, photo);
    });
    await Promise.all(tasks);
    const thumbnailsDirectory = path.join(inputDirectory, 'thumbnails');
    await createThumbnailsDirectory(thumbnailsDirectory);
    await batchResize(config, photos, thumbnailsDirectory);
    const generatedPagePath = path.join(inputDirectory, 'index.html');
    await generatePage(templatePath, photos, generatedPagePath);
  } catch (error) {
    console.error(error.message);
  }
};

main();
