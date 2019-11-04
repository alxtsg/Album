/**
 * Configurations module.
 *
 * @author Alex TSANG <alextsang@live.com>
 *
 * @license BSD-3-Clause
 */

'use strict';

const dotenv = require('dotenv');

const path = require('path');

const RADIX = 10;

/**
 * Path of .env file.
 */
const envFile = path.join(
  __dirname,
  '.env'
);

const config = {
  gmPath:null,
  maxWidth: null,
  maxHeight: null
};

const result = dotenv.config({
  path: envFile
});
if (result.error !== undefined) {
  throw new Error(`Unable to read .env: ${result.error.message}`);
}
const envConfig = result.parsed;
config.gmPath = envConfig.GM_PATH;
config.maxWidth = parseInt(envConfig.MAX_WIDTH, RADIX);
config.maxHeight = parseInt(envConfig.MAX_HEIGHT, RADIX);

module.exports = config;
