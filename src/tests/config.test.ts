import assert from 'assert';

import config from '../config';

const MAX_WIDTH: number = 100;
const MAX_HEIGHT: number = 100;

describe('Configurations module', async () => {
  it('can load configurations', async () => {
    assert.strictEqual((config.gmPath.length > 0), true);
    assert.strictEqual(config.maxWidth, MAX_WIDTH);
    assert.strictEqual(config.maxHeight, MAX_HEIGHT);
  });
});
