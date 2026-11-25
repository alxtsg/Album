import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { suite, test } from 'node:test';

import * as app from '#app/src/app.js';

const DATA_DIR = path.join(__dirname, 'data');
const THUMBNAILS_DIR_NAME = 'thumbnails';
const GENERATED_VIDEO_NAME = 'video-mov.mp4';
const GENERATED_PAGE_NAME = 'index.html';

suite('Main application', async () => {
  test('can generate a page with given the directory', async () => {
    const tempDir = await fsPromises.mkdtemp(os.tmpdir() + path.sep);
    await fsPromises.cp(DATA_DIR, tempDir, { recursive: true });

    await assert.doesNotReject(async () => {
      await app.run(tempDir);

      const thumbnailsDir = path.join(tempDir, THUMBNAILS_DIR_NAME);
      const generatedVideo = path.join(tempDir, GENERATED_VIDEO_NAME);
      const generatePage = path.join(tempDir, GENERATED_PAGE_NAME);

      const thumbnailsDirStat = await fsPromises.stat(thumbnailsDir);
      assert.strictEqual(thumbnailsDirStat.isDirectory(), true);
      const videoStat = await fsPromises.stat(generatedVideo);
      assert.strictEqual(videoStat.isFile(), true);
      const pageStat = await fsPromises.stat(generatePage);
      assert.strictEqual(pageStat.isFile(), true);
      const pageContent = await fsPromises.readFile(
        generatePage,
        {
          encoding: 'utf8'
        }
      );
      assert.strictEqual((pageContent.length > 0), true);
    });

    await fsPromises.rm(tempDir, { recursive: true });
  });
});
