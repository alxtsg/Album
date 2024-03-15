import assert from 'assert';
import fsPromises from 'fs/promises';
import path from 'path';

import * as videoProcessor from '../../processors/video-processor';

import type VideoView from '../../types/video-view';

const INPUT_MOV_FILE = path.join(__dirname, '..', 'data', 'video-mov.mov');
const INPUT_MP4_FILE = path.join(__dirname, '..', 'data', 'video-mp4.mp4');
const OUTPUT_MOV_FILE = path.join(__dirname, '..', 'data', 'video-mov.mp4');
const OUTPUT_MP4_FILE = path.join(__dirname, '..', 'data', 'video-mp4.mp4');
const SRC_MOV_PATH = 'video-mov.mp4';
const SRC_MP4_PATH = 'video-mp4.mp4';

describe('Video processor', async () => {
  it('can process a video file', async () => {
    await assert.doesNotReject(async () => {
      const view: VideoView = await videoProcessor.process(
        INPUT_MOV_FILE,
        OUTPUT_MOV_FILE,
        SRC_MOV_PATH
      );
      assert.strictEqual(Object.hasOwn(view, 'video?'), true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'width'), true);
      assert.strictEqual(view['video?'].width > 0, true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'height'), true);
      assert.strictEqual(view['video?'].height > 0, true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'path'), true);
      assert.strictEqual(view['video?'].path, SRC_MOV_PATH);
      assert.strictEqual(Object.hasOwn(view['video?'], 'timestamp'), true);
      assert.strictEqual(view['video?'].timestamp.length > 0, true);
    });

    await fsPromises.unlink(OUTPUT_MOV_FILE);
  });

  it('can skip video formats which does not require conversion', async () => {
    await assert.doesNotReject(async () => {
      const view: VideoView = await videoProcessor.process(
        INPUT_MP4_FILE,
        OUTPUT_MP4_FILE,
        SRC_MP4_PATH
      );
      assert.strictEqual(Object.hasOwn(view, 'video?'), true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'width'), true);
      assert.strictEqual(view['video?'].width > 0, true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'height'), true);
      assert.strictEqual(view['video?'].height > 0, true);
      assert.strictEqual(Object.hasOwn(view['video?'], 'path'), true);
      assert.strictEqual(view['video?'].path, SRC_MP4_PATH);
      assert.strictEqual(Object.hasOwn(view['video?'], 'timestamp'), true);
      assert.strictEqual(view['video?'].timestamp.length > 0, true);
    });

    // No cleanup is needed.
  });
});
