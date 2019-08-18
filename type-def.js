/**
 * @typedef {object} Config Program configurations.
 * @property {string} gmPath GraphicsMagick path.
 */

/**
 * @typedef {object} Photo Photo data.
 * @property {string} filename Filename of photo.
 * @property {string} path Absolute path of photo.
 * @property {string} modTime Modification time, in ISO 8601.
 */

const Config = {
  gmPath: null
};

const Photo = {
  filename: null,
  path: null,
  modTime: null
};

module.exports = {
  Config,
  Photo
};
