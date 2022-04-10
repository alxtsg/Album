import assert from 'assert';

import * as fsUtils from '../fs-utils';

describe('Filesystem utilities', (): void => {
  it('can check directory', async () => {
    await assert.doesNotReject(async () => {
      const isDirectory: boolean = await fsUtils.isDirectory(__dirname);
      assert.strictEqual(isDirectory, true);
    });
  });
});
