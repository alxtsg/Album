import assert from 'assert';
import fsPromises from 'fs/promises';
import path from 'path';

import * as pageUtils from '../page-utils';

import type Photo from '../types/photo';

const GENERATED_PAGE = path.join(__dirname, 'test.html');

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
      const pageContent = await fsPromises.readFile(
        GENERATED_PAGE,
        {
          encoding: 'utf8'
        }
      );
      for (const photo of photos) {
        assert.strictEqual(pageContent.includes(photo.path), true);
        assert.strictEqual(pageContent.includes(photo.altText), true);
        assert.strictEqual(pageContent.includes(photo.timestamp), true);
      }
    });
    await fsPromises.unlink(GENERATED_PAGE);
  });
});
