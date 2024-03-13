interface Video {
  /**
   * The width of the video display area, in CSS pixels.
   */
  width: number;

  /**
   * Path of the video file.
   */
  path: string;

  /**
   * Timestamp of when the video was captured.
   */
  timestamp: string;
}

export default interface VideoView {
  'video?': Video;
}
