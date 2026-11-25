import path from 'node:path';
import process from 'node:process';

import type AppConfig from '#app/src/types/app-config.d.ts';

const ENV_FILE = path.join(__dirname, '.env');

const config: AppConfig = {
  thumbnailFormat: 'jpeg',
  videoFormat: 'mp4',
  maxWidth: 0,
  maxHeight: 0,
};

const loadConfig = (): void => {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch (error) {
    throw new Error(`Unable to read .env: ${(error as Error).message}`);
  }

  if (!Number.isInteger(Number(process.env.MAX_WIDTH))) {
    throw new Error('Invalid maximum width value.');
  }
  config.maxWidth = Number(process.env.MAX_WIDTH);

  if (!Number.isInteger(Number(process.env.MAX_HEIGHT))) {
    throw new Error('Invalid maximum height value.');
  }
  config.maxHeight = Number(process.env.MAX_HEIGHT);
};

loadConfig();

export default config;
