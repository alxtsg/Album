import dotenv from 'dotenv';

import path from 'path';

import type AppConfig from './types/app-config';

const ENV_FILE = path.join(__dirname, '.env');

const config: AppConfig = {
  thumbnailFormat: 'jpeg',
  videoFormat: 'mp4',
  maxWidth: 0,
  maxHeight: 0,
};

const loadConfig = (): void => {
  const result = dotenv.config({
    path: ENV_FILE
  });
  if (result.error !== undefined) {
    throw new Error(`Unable to read .env: ${result.error.message}`);
  }
  if (result.parsed === undefined) {
    throw new Error('No parsed configurations.');
  }
  const envConfig = result.parsed;
  if (!Number.isInteger(Number(envConfig.MAX_WIDTH))) {
    throw new Error('Invalid maximum width value.');
  }
  if (!Number.isInteger(Number(envConfig.MAX_HEIGHT))) {
    throw new Error('Invalid maximum height value.');
  }
  config.maxWidth = Number(envConfig.MAX_WIDTH);
  config.maxHeight = Number(envConfig.MAX_HEIGHT);
};

loadConfig();

export default config;
