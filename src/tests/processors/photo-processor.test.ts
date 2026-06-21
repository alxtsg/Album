import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

import * as photoProcessor from '#app/src/processors/photo-processor.js';

import type PhotoView from '#app/src/types/photo-view.d.ts';

const INPUT_FILE = path.join(__dirname, '..', 'data', '01.jpeg');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '01-processed.jpeg');
const SRC_PATH = '01-processed.jpeg';

describe('Photo processor', async () => {
  it('can process a photo file', async () => {
    await assert.doesNotReject(async () => {
      const view: PhotoView = await photoProcessor.process(
        INPUT_FILE,
        OUTPUT_FILE,
        SRC_PATH
      );
      assert.strictEqual(Object.hasOwn(view, 'photo?'), true);
      assert.strictEqual(Object.hasOwn(view['photo?'], 'path'), true);
      assert.strictEqual(view['photo?'].path, SRC_PATH);
      assert.strictEqual(Object.hasOwn(view['photo?'], 'timestamp'), true);
      assert.strictEqual(view['photo?'].timestamp.length > 0, true);
    });

    await fsPromises.unlink(OUTPUT_FILE);
  });
});
