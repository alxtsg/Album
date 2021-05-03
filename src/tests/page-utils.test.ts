import assert from 'assert';
import fs from 'fs';
import path from 'path';

import * as fsUtils from '../fs-utils';
import * as pageUtils from '../page-utils';
import Photo from '../types/photo';

const GENERATED_PAGE: string = path.join(__dirname, 'test.html');

const fsPromises = fs.promises;

describe('Page utilities', async () => {
  it('can generate a page', async () => {
    const photos: Photo[] = [
      {
        path: 'thumbnail/01.jpeg',
        altText: 'First photo.',
        timestamp: '2021-01-01T00:00:00'
      },
      {
        path: 'thumbnail/02.jpeg',
        altText: 'Second photo.',
        timestamp: '2021-01-01T01:00:00'
      },
      {
        path: 'thumbnail/03.jpeg',
        altText: 'Third photo.',
        timestamp: '2021-01-01T02:00:00'
      }
    ];
    await assert.doesNotReject(async () => {
      await pageUtils.generatePage(photos, GENERATED_PAGE);
      const pageContent: string = await fsUtils.getFileContent(GENERATED_PAGE);
      for (const photo of photos) {
        assert.strictEqual(pageContent.includes(photo.path), true);
        assert.strictEqual(pageContent.includes(photo.altText), true);
        assert.strictEqual(pageContent.includes(photo.timestamp), true);
      }
    });
    await fsPromises.unlink(GENERATED_PAGE);
  });
});
