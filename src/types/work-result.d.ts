import type MediaView from '#app/src/types/media-view.d.ts';

export default interface WorkResult {
  // Path of file being processed.
  inputPath: string;

  // Generated view.
  view: MediaView;
}
