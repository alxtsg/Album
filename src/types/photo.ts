export default interface Photo {
  /**
   * Path of the photo.
   */
  path: string;

  /**
   * Alternative text description of the photo.
   */
  altText: string;

  /**
   * Timestamp of when the photo was captured.
   */
  timestamp: string;
}
