import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

import * as pageUtils from '#app/src/page-utils.js';

import type MediaView from '#app/src/types/media-view.d.ts';

const GENERATED_PAGE = path.join(__dirname, 'test.html');

describe('Page utilities', async () => {
  it('can generate a page', async () => {
    const mediaViews: MediaView[] = [
      {
        'photo?': {
          path: 'thumbnail/01.jpeg',
          timestamp: '2021-01-01T00:00:00'
        }
      },
      {
        'video?': {
          width: 1280,
          height: 720,
          path: '01.mov',
          timestamp: '2021-01-02T02:00:00'
        }
      },
      {
        'photo?': {
          path: 'thumbnail/02.jpeg',
          timestamp: '2021-01-03T03:00:00'
        }
      }
    ];
    await assert.doesNotReject(async () => {
      await pageUtils.generatePage(mediaViews, GENERATED_PAGE);
    });

    await fsPromises.unlink(GENERATED_PAGE);
  });
});
