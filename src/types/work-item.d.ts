import type * as photoProcessor from './processors/photo-processor';
import type * as videoProcessor from './processors/video-processor';

export default interface WorkItem {
  /**
   * Processor of the file.
   */
  processor: photoProcessor | videoProcessor;

  /**
   * Path of the file to be processed.
   */
  inputPath: string;

  /**
   * Path of the processed file.
   */
  outputPath: string;

  /**
   * Path of file being referenced in the HTML tag.
   */
  srcPath: string;
}
