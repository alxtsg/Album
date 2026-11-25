import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { suite, test } from 'node:test';

import * as photoProcessor from '#app/src/processors/photo-processor.js';

import type PhotoView from '#app/src/types/photo-view.d.ts';

const DATA_DIR = path.join(__dirname, '..', 'data');
const INPUT_FILE_NAME = '01.jpeg'
const OUTPUT_FILE_NAME = '01-processed.jpeg'
const SRC_PATH = '01-processed.jpeg';

suite('Photo processor', async () => {
  test('can process a photo file', async () => {
    const tempDir = await fsPromises.mkdtemp(os.tmpdir() + path.sep);
    const inputFile = path.join(tempDir, INPUT_FILE_NAME);
    fsPromises.copyFile(path.join(DATA_DIR, INPUT_FILE_NAME), inputFile);

    await assert.doesNotReject(async () => {
      const view: PhotoView = await photoProcessor.process(
        inputFile,
        path.join(tempDir, OUTPUT_FILE_NAME),
        SRC_PATH
      );
      assert.strictEqual(Object.hasOwn(view, 'photo?'), true);
      assert.strictEqual(Object.hasOwn(view['photo?'], 'path'), true);
      assert.strictEqual(view['photo?'].path, SRC_PATH);
      assert.strictEqual(Object.hasOwn(view['photo?'], 'timestamp'), true);
      assert.strictEqual(view['photo?'].timestamp.length > 0, true);
    });

    await fsPromises.rm(tempDir, { recursive: true });
  });
});
