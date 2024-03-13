import assert from 'assert';
import fsPromises from 'fs/promises';
import path from 'path';

import * as videoProcessor from '../../processors/video-processor';

import type VideoView from '../../types/video-view';

const INPUT_FILE = path.join(__dirname, '..', 'data', '01.mov');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '01.mp4');
const SRC_PATH = '01.mp4';

describe('Video processor', async () => {
  it('can process a photo file', async () => {
    await assert.doesNotReject(async () => {
      const view: VideoView = await videoProcessor.process(
        INPUT_FILE,
        OUTPUT_FILE,
        SRC_PATH
      );
      assert.strictEqual(Object.hasOwn(view, 'video?'), true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'width'), true);
      assert.strictEqual(view['video?'].width > 0, true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'path'), true);
      assert.strictEqual(view['video?'].path, SRC_PATH);
      assert.strictEqual(Object.hasOwn(view['video?'], 'timestamp'), true);
      assert.strictEqual(view['video?'].timestamp.length > 0, true);
    });
    await fsPromises.unlink(OUTPUT_FILE);
  });
});
