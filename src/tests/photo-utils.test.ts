import assert from 'assert';
import fs from 'fs';
import path from 'path';

import * as fsUtils from '../fs-utils';
import * as photoUtils from '../photo-utils';

const INPUT_DIR: string = path.join(__dirname, 'data');
const OUTPUT_DIR: string = path.join(__dirname, 'test-output');
const TIMESTAMP_REGEX: RegExp = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;

const fsPromises = fs.promises;

describe('Photo utilities', async () => {
  it('can get photo capture timestamp', async () => {
    const filenames: string[] = await fsUtils.getFilenames(INPUT_DIR);
    await assert.doesNotReject(async () => {
      for (const filename of filenames) {
        const photo: string = path.join(INPUT_DIR, filename);
        const timestamp: string = await photoUtils.getCaptureTimestamp(photo);
        assert.strictEqual(TIMESTAMP_REGEX.test(timestamp), true);
      }
    });
  });

  it('can resize photos', async () => {
    await fsUtils.createDirectory(OUTPUT_DIR);
    const filenames: string[] = await fsUtils.getFilenames(INPUT_DIR);
    await assert.doesNotReject(async () => {
      await photoUtils.resizePhotos(INPUT_DIR, OUTPUT_DIR);
      const resizedPhotos: string[] = await fsUtils.getFilenames(OUTPUT_DIR);
      assert.strictEqual(resizedPhotos.length, filenames.length);
      for (const filename of filenames) {
        assert.strictEqual(resizedPhotos.includes(filename), true);
      }
    });
    await fsPromises.rmdir(OUTPUT_DIR, { recursive: true });
  });
});
