import assert from 'assert';
import fs from 'fs';
import path from 'path';

import * as app from '../app';
import * as fsUtils from '../fs-utils';

const INPUT_DIR: string = path.join(__dirname, 'data');
const THUMBNAILS_DIR: string = path.join(INPUT_DIR, 'thumbnails');
const GENERATED_PAGE: string = path.join(INPUT_DIR, 'index.html');

const fsPromises = fs.promises;

describe('Main application', async (): Promise<void> => {
  it('can generate a page with given the photo directory', async (): Promise<void> => {
    await assert.doesNotReject(async (): Promise<void> => {
      await app.run(INPUT_DIR);
      const isDirectory: boolean = await fsUtils.isDirectory(THUMBNAILS_DIR);
      assert.strictEqual(isDirectory, true);
      const pageContent: string = await fsUtils.getFileContent(GENERATED_PAGE);
      assert.strictEqual((pageContent.length > 0), true);
    });
    await fsPromises.rmdir(THUMBNAILS_DIR, { recursive: true });
    await fsPromises.unlink(GENERATED_PAGE);
  });
});
