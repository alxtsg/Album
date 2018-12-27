# Album #

## Description ##

A simply album webpage generation tool.

## Requirements ##

* Node.js (`>=6.11.0`).
* GraphicsMagick (`>=1.3.25`).

## Installation ##

0. `npm install --production`.

## Usage ##

The configuration file `config.json` controls the following:

* `gmPath`: Path of GraphicsMagick executable file. Default value is the default installation path of GraphicsMagick on Windows.

Run:

    node index.js <input-dir>

Command arguments:

* `<input-dir>`: A directory contains photos in JPEG format with EXIF data.

The following will be created in the specified directory:

* `index.html`: The generated webpage.
* `thumbnails`: The directory contains thumbnails of the photos. Each photo is resized so that the image dimension is 1280 pixels (width) by 720 pixels (height) at maximum.

## Examples ##

Assume there is directory `/path/to/album-20170101` contains photos in JPEG format with EXIF data:

    node index.js /path/to/album-20170101

The generated webpage `index.html` and thumbnails directory `thumbnails` can be found in the directory.

## License ##

[The BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)
