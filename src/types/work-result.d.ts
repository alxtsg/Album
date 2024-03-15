import type MediaView from "./media-view";

export default interface WorkResult {
  // Path of file being processed.
  inputPath: string;

  // Generated view.
  view: MediaView;
}
