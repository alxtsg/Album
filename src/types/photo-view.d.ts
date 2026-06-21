import type MediaView from '#app/src/types/media-view.d.ts';

interface Photo {
  /**
   * Path of the photo file.
   */
  path: string;

  /**
   * Timestamp of when the photo was captured.
   */
  timestamp: string;
}

export default interface PhotoView extends MediaView {
  'photo?': Photo;
}
