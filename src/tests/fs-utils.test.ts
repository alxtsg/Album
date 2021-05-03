import assert from 'assert';
import fs from 'fs';
import path from 'path';

import * as fsUtils from '../fs-utils';

const fsPromises = fs.promises;

describe('Filesystem utilities', (): void => {
  it('can check directory', async () => {
    await assert.doesNotReject(async () => {
      const isDirectory: boolean = await fsUtils.isDirectory(__dirname);
      assert.strictEqual(isDirectory, true);
    });
  });

  it('can create a directory', async () => {
    const tempDir: string = path.join(__dirname, 'test-directory');
    await assert.doesNotReject(async () => {
      await fsUtils.createDirectory(tempDir);
    });
    await fsPromises.rmdir(tempDir, { recursive: true });
  });

  it('can get filenames under a directory', async () => {
    await assert.doesNotReject(async () => {
      const files: string[] = await fsUtils.getFilenames(__dirname);
      assert.strictEqual(Array.isArray(files), true);
      assert.strictEqual((files.length > 0), true);
    });
  });

  it('can get file content', async () => {
    await assert.doesNotReject(async () => {
      const fileContent: string = await fsUtils.getFileContent(__filename);
      assert.strictEqual((fileContent.length > 0), true);
    });
  });

  it('can write file', async () => {
    const filename: string = `test-${Date.now()}.file`;
    const tempFile: string = path.join(__dirname, filename);
    await assert.doesNotReject(async () => {
      await fsUtils.writeFile(tempFile, 'TEST');
    });
    await fsPromises.unlink(tempFile);
  });
});
