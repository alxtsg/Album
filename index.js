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
 */

const mustache = require('mustache');

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const config = require('./config');

const TEMPLATE_PATH = path.join(__dirname, 'template.mustache');

const EXPECTED_ARG_LENGTH = 3;
const NORMAL_EXIT_CODE = 0;
const MOD_TIME_REGEX = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
const DEFAULT_MOD_TIME = '0001-01-01T00:00:00';

/**
 * Prints program usage.
 */
const printUsage = () => {
  const scriptPath = process.argv[1];
  console.error(`Usage: node ${scriptPath} <input-dir>`);
};

/**
 * Checks if the given path is a directory.
 *
 * @param {string} directory Directory path.
 *
 * @returns {Promise<boolean>} A Promise resolved with a boolean value which
 *                             indicates whether the path is a directory, or a
 *                             Promise rejected with an Error.
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
 * @returns {Promise<string>} A Promise resolved with the file content, or a
 *                            Promise rejected with an Error.
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
 * @returns {Promise} A Promise resolved without a value, ora Promise rejected
 *                    with an Error.
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
 * Gets filenames of photos.
 *
 * @param {string} directory Directory path.
 *
 * @returns {Promise<string[]>} A Promise resolved with an array of filenames of
 *                              photos in the directory, or a Promise rejected
 *                              with an Error.
 */
const getPhotoFilenames = (directory) => {
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
 * Gets modification time of a photo.
 *
 * @param {string} gmPath Path of the GraphicsMagick executable.
 * @param {string} photoPath Absolute path of the photo.
 *
 * @returns {Promise<string>} A Promise resolved with the modification time, in
 *                            ISO 8601, of the photo, or a Promise rejected with
 *                            an Error.
 */
const getModTime = (gmPath, photoPath) => {
  const commandArguments = [
    'identify',
    '-format',
    "'%[EXIF:DateTimeOriginal]'",
    photoPath
  ];
  return new Promise((resolve, reject) => {
    const gm = childProcess.spawn(gmPath, commandArguments);
    let output = '';
    gm.stdout.on('data', (data) => {
      output += data;
    });
    gm.stderr.on('data', (data) => {
      console.error(data);
    });
    gm.once('error', (error) => {
      reject(error);
      return;
    });
    gm.once('close', (code) => {
      if (code !== NORMAL_EXIT_CODE) {
        reject(new Error(`GraphicsMagick exited with code ${code}.`));
        return;
      }
      // The expected format of extracted modification time reported by
      // GraphicsMagick is:
      // YYYY:MM:DD HH:mm:ss
      if (!MOD_TIME_REGEX.test(output)) {
        resolve(DEFAULT_MOD_TIME);
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
      resolve(`${datePart}T${timePart}`);
    });
  });
};

/**
 * Creates thumbnails directory.
 *
 * @param {string} directory Absolute path of the thumnails directory.
 *
 * @returns {Promise} A Promise resolved without a value, or a Promise rejected
 *                    with an Error.
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
 * Resizes photos in a batch.
 *
 * @param {Config} config Configuration.
 * @param {string} inputDir Absolute path of the input directory.
 * @param {string[]} filenames Filenames of photos.
 * @param {string} thumbnailsDir Absolute path of the thumbnails directory.
 *
 * @returns {Promise<void>} A Promise resolved without a value, or a Promise
 *                          rejected with an Error.
 */
const batchResize = (config, inputDir, filenames, thumbnailsDir) => {
  return new Promise((resolve, reject) => {
    const commandArguments = [
      'batch',
      '-'
    ];
    const gm = childProcess.spawn(config.gmPath, commandArguments);
    gm.once('error', (error) => {
      reject(error);
      gm.kill();
    });
    gm.once('close', (code) => {
      if (code !== 0) {
        reject(new Error(`GraphicsMagick exit with code ${code}.`));
        return;
      }
      resolve();
    });
    const batchCommands = filenames.map((filename) => {
      const originalPhotoPath = path.join(inputDir, filename);
      const thumbnailPath = path.join(thumbnailsDir, filename);
      const command = [
        'convert',
        '-auto-orient',
        '-geometry',
        `${config.maxWidth}x${config.maxHeight}`,
        '-strip',
        originalPhotoPath,
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
 * Generates a page (HTML document).
 *
 * @param {string} template Absolute path of the template file.
 * @param {string[]} filenames Filenames of the photos.
 * @param {string[]} modTimes Modification times of the photos.
 * @param {string} page Absolute path of the generated page.
 *
 * @returns {Promise<void>} A Promise resolved without a value, or a Promise
 *                          rejected with an Error.
 */
const generatePage = async (template, filenames, modTimes, page) => {
  try {
    const templateContent = await getFileContent(template);
    const view = {
      currentTimestamp: (new Date()).toISOString(),
      photos: filenames.map((filename, index) => {
        return {
          filename,
          altText: `Photo captured at ${modTimes[index]}.`,
          timestamp: modTimes[index]
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
    printUsage();
    return;
  }
  const inputDir = process.argv[2];
  try {
    const isValidDirectory = await isDirectory(inputDir)
    if (!isValidDirectory) {
      console.error(`${inputDir} is not a directory.`);
      return;
    }
    const filenames = await getPhotoFilenames(inputDir);
    const tasks = filenames.map((filename) => {
      return getModTime(config.gmPath, path.join(inputDir, filename));
    });
    const modTimes = [];
    for await (const modTime of tasks) {
      modTimes.push(modTime);
    }
    const thumbnailsDir = path.join(inputDir, 'thumbnails');
    await createThumbnailsDirectory(thumbnailsDir);
    await batchResize(config, inputDir, filenames, thumbnailsDir);
    const generatedPagePath = path.join(inputDir, 'index.html');
    await generatePage(TEMPLATE_PATH, filenames, modTimes, generatedPagePath);
  } catch (error) {
    console.error(error.message);
  }
};

main();
