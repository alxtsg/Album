import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { suite, test } from 'node:test';

import * as videoProcessor from '#app/src/processors/video-processor.js';

import type VideoView from '#app/src/types/video-view.d.ts';

const DATA_DIR = path.join(__dirname, '..', 'data');
const INPUT_MOV_FILE_NAME = 'video-mov.mov';
const INPUT_MP4_FILE_NAME = 'video-mp4.mp4';
const OUTPUT_MOV_FILE_NAME = 'video-mov.mp4';
const OUTPUT_MP4_FILE_NAME = 'video-mp4.mp4';
const SRC_MOV_PATH = 'video-mov.mp4';
const SRC_MP4_PATH = 'video-mp4.mp4';

suite('Video processor', async () => {
  test('can process a video file', async () => {
    const tempDir = await fsPromises.mkdtemp(os.tmpdir() + path.sep);
    const inputFile = path.join(tempDir, INPUT_MOV_FILE_NAME);
    fsPromises.copyFile(path.join(DATA_DIR, INPUT_MOV_FILE_NAME), inputFile);

    await assert.doesNotReject(async () => {
      const view: VideoView = await videoProcessor.process(
        inputFile,
        path.join(tempDir, OUTPUT_MOV_FILE_NAME),
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

    await fsPromises.rm(tempDir, { recursive: true });
  });

  test('can skip video formats which does not require conversion', async () => {
    const tempDir = await fsPromises.mkdtemp(os.tmpdir() + path.sep);
    const inputFile = path.join(tempDir, INPUT_MP4_FILE_NAME);
    fsPromises.copyFile(path.join(DATA_DIR, INPUT_MP4_FILE_NAME), inputFile);

    await assert.doesNotReject(async () => {
      const view: VideoView = await videoProcessor.process(
        inputFile,
        path.join(tempDir, OUTPUT_MP4_FILE_NAME),
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

    await fsPromises.rm(tempDir, { recursive: true });
  });
});
