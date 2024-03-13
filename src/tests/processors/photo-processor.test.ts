import assert from 'assert';
import fsPromises from 'fs/promises';
import path from 'path';

import * as photoProcessor from '../../processors/photo-processor';

import type PhotoView from '../../types/photo-view';

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
