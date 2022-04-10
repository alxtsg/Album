import assert from 'assert';

import config from '../config';

const THUMBNAIL_FORMAT = 'jpeg';
const MAX_WIDTH= 100;
const MAX_HEIGHT = 100;

describe('Configurations module', async () => {
  it('can load configurations', async () => {
    assert.strictEqual(config.thumbnailFormat, THUMBNAIL_FORMAT);
    assert.strictEqual(config.maxWidth, MAX_WIDTH);
    assert.strictEqual(config.maxHeight, MAX_HEIGHT);
  });
});
