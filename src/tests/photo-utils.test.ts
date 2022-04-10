import assert from 'assert';
import fsPromises from 'fs/promises';
import path from 'path';

import * as photoUtils from '../photo-utils';

const INPUT_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, 'test-output');
const TIMESTAMP_REGEX = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;

describe('Photo utilities', async () => {
  it('can get photo capture timestamp', async () => {
    const filenames = await fsPromises.readdir(INPUT_DIR);
    await assert.doesNotReject(async () => {
      for (const filename of filenames) {
        const photo = path.join(INPUT_DIR, filename);
        const timestamp = await photoUtils.getCaptureTimestamp(photo);
        assert.strictEqual(TIMESTAMP_REGEX.test(timestamp), true);
      }
    });
  });

  it('can resize photos', async () => {
    await fsPromises.mkdir(OUTPUT_DIR);
    const filenames = await fsPromises.readdir(INPUT_DIR);
    await assert.doesNotReject(async () => {
      await photoUtils.resizePhotos(INPUT_DIR, OUTPUT_DIR);
      const resizedPhotos = await fsPromises.readdir(OUTPUT_DIR);
      assert.strictEqual(resizedPhotos.length, filenames.length);
      for (const filename of filenames) {
        assert.strictEqual(resizedPhotos.includes(filename), true);
      }
    });
    await fsPromises.rm(OUTPUT_DIR, { recursive: true });
  });
});
