import mustache from 'mustache';

import fsPromises from 'fs/promises';
import path from 'path';

import type Photo from './types/photo';

const TEMPLATE: string = path.join(__dirname, 'template.mustache');

/**
 * Generates a page using the given photos.
 *
 * @param photos Photos to be embedded in the page.
 * @param page Absolute path of the generated page.
 *
 * @returns A Promise resolves without a value.
 */
export const generatePage = async (photos: Photo[], page: string) => {
  const templateContent = await fsPromises.readFile(
    TEMPLATE,
    {
      encoding: 'utf8'
    }
  );
  const view = {
    currentTimestamp: (new Date()).toISOString(),
    photos
  };
  const pageContent = mustache.render(templateContent, view);
  await fsPromises.writeFile(page, pageContent);
};
