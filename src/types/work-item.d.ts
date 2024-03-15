export default interface WorkItem {
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
