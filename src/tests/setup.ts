import fs from 'fs';
import path from 'path';

const ENV_TEMPLATE: string = path.join(__dirname, '..', '.env.template');
const ENV_FILE: string = path.join(__dirname, '..', '.env');

const fsPromises = fs.promises;

const main = async (): Promise<void> => {
  await fsPromises.copyFile(ENV_TEMPLATE, ENV_FILE);
};

main();
