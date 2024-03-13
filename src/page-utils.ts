import mustache from 'mustache';

import fsPromises from 'fs/promises';
import path from 'path';

import type MediaView from './types/media-view';

const TEMPLATE: string = path.join(__dirname, 'template.mustache');

/**
 * Generates a page using the given media file views.
 *
 * @param mediaViews Media file view objects.
 * @param pagePath Absolute path of the generated page.
 *
 * @returns A Promise resolves without a value.
 */
export const generatePage = async (mediaViews: MediaView[], pagePath: string) => {
  const templateContent = await fsPromises.readFile(
    TEMPLATE,
    {
      encoding: 'utf8'
    }
  );
  const view = {
    currentTimestamp: (new Date()).toISOString(),
    mediaFiles: mediaViews
  };
  const pageContent = mustache.render(templateContent, view);
  await fsPromises.writeFile(pagePath, pageContent);
};
