export default interface AppConfig {
  /**
   * Thumbnail image format.
   */
  thumbnailFormat: 'jpeg';

  /**
   * Video format.
   */
  videoFormat: 'mp4';

  /**
   * Maximum width of a resized image.
   */
  maxWidth: number;

  /**Maximum height of a resized image.
   *
   */
  maxHeight: number;
}
