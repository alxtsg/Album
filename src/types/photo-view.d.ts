import type MediaView from "./media-view";

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
