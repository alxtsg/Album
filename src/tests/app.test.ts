import assert from 'assert';
import fsPromises from 'fs/promises';
import path from 'path';

import * as app from '../app';

const INPUT_DIR = path.join(__dirname, 'data');
const THUMBNAILS_DIR = path.join(INPUT_DIR, 'thumbnails');
const GENERATED_PAGE = path.join(INPUT_DIR, 'index.html');
const TEST_TIMEOUT = 5000;

describe('Main application', async () => {
  it('can generate a page with given the directory', async () => {
    await assert.doesNotReject(async () => {
      await app.run(INPUT_DIR);
      const stat = await fsPromises.stat(THUMBNAILS_DIR);
      assert.strictEqual(stat.isDirectory(), true);
      const pageContent = await fsPromises.readFile(
        GENERATED_PAGE,
        {
          encoding: 'utf8'
        }
      );
      assert.strictEqual((pageContent.length > 0), true);
    });
    await fsPromises.rm(THUMBNAILS_DIR, { recursive: true });
    await fsPromises.unlink(GENERATED_PAGE);
  }).timeout(TEST_TIMEOUT);
});
