import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { suite, test } from 'node:test';

import * as pageUtils from '#app/src/page-utils.js';

import type MediaView from '#app/src/types/media-view.d.ts';

const GENERATED_PAGE_NAME = 'test.html';

suite('Page utilities', async () => {
  test('can generate a page', async () => {
    const tempDir = await fsPromises.mkdtemp(os.tmpdir());
    const generatedPage = path.join(tempDir, GENERATED_PAGE_NAME);

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
      await pageUtils.generatePage(mediaViews, generatedPage);
    });

    await fsPromises.rm(tempDir, { recursive: true });
  });
});
