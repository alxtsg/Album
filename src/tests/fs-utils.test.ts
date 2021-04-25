import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';

import * as fsUtils from '../fs-utils';

const fsPromises = fs.promises;

describe('Filesystem utilities', (): void => {
  it('can check directory', async (): Promise<void> => {
    await assert.doesNotReject(async (): Promise<void> => {
      const isDirectory = await fsUtils.isDirectory(__dirname);
      assert.strictEqual(isDirectory, true);
    });
  });

  it('can create a directory', async (): Promise<void> => {
    const tempDir = path.join(__dirname, 'test-directory');
    await assert.doesNotReject(async (): Promise<void> => {
      await fsUtils.createDirectory(tempDir);
    });
    await fsPromises.rmdir(tempDir, { recursive: true });
  });

  it('can get filenames under a directory', async (): Promise<void> => {
    await assert.doesNotReject(async (): Promise<void> => {
      const files = await fsUtils.getFilenames(__dirname);
      assert.strictEqual(Array.isArray(files), true);
      assert.strictEqual((files.length > 0), true);
    });
  });

  it('can get file content', async (): Promise<void> => {
    await assert.doesNotReject(async (): Promise<void> => {
      const fileContent = await fsUtils.getFileContent(__filename);
      assert.strictEqual((fileContent.length > 0), true);
    });
  });

  it('can write file', async (): Promise<void> => {
    const tempDir = await fsPromises.mkdtemp(os.tmpdir());
    const tempFile = path.join(tempDir, 'test.file');
    await assert.doesNotReject(async (): Promise<void> => {
      await fsUtils.writeFile(tempFile, 'TEST');
    });
    await fsPromises.rmdir(tempDir, { recursive: true });
  });
});
