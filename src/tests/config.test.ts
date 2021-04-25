import assert from 'assert';

import config from '../config';

const GM_PATH: string = 'C:\\Program Files\\GraphicsMagick-1.3.36-Q8\\gm.exe'
const MAX_WIDTH: number = 100;
const MAX_HEIGHT: number = 100;

describe('Configurations module', async (): Promise<void> => {
  it('can load configurations', async (): Promise<void> => {
    assert.strictEqual(config.gmPath, GM_PATH);
    assert.strictEqual(config.maxWidth, MAX_WIDTH);
    assert.strictEqual(config.maxHeight, MAX_HEIGHT);
  });
});
