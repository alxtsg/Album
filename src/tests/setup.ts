import fsPromises from 'fs/promises';
import path from 'path';

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_CONTENT = [
  'MAX_WIDTH=100',
  'MAX_HEIGHT=100'
].join('\n');

const main = async () => {
  await fsPromises.writeFile(ENV_FILE, ENV_CONTENT)
};

main();
