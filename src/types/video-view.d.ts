import MediaView from "./media-view";

interface Video {
  /**
   * The width of the video display area, in CSS pixels.
   */
  width: number;

  /**
   * The height of the video display area, in CSS pixels.
   */
  height: number;

  /**
   * Path of the video file.
   */
  path: string;

  /**
   * Timestamp of when the video was captured.
   */
  timestamp: string;
}

export default interface VideoView extends MediaView {
  'video?': Video;
}
