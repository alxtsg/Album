# Album #

## Description ##

Static album page generation tool.

## Requirements ##

* Node.js (`>=10.16.3`).
* GraphicsMagick (`>=1.3.33`).

## Installation ##

0. `npm install --production`.

## Usage ##

Create a configuration file with the name `.env`. The configuration file
controls the following:

* `GM_PATH`: Path of GraphicsMagick executable file.
* `MAX_WIDTH`: Maximum width (in pixels) of each generated thumbnail.
* `MAX_HEIGHT`: Maximum height (in pixels) of each generated thumbnail.

An example `.env.template` is provided as a reference.

Run:

    node index.js <input-dir>

Command arguments:

* `<input-dir>`: A directory contains photos in JPEG format with EXIF data.

The following will be created in the specified directory:

* `index.html`: The generated webpage.
* `thumbnails`: The directory contains thumbnails of the photos. Each photo is
                resized if it is larger than the specified size.

## Examples ##

Assume there is directory `/path/to/album-20170101` contains photos in JPEG
format with EXIF data:

    node index.js /path/to/album-20170101

The generated webpage `index.html` and thumbnails directory `thumbnails` can be
found in the directory.

## License ##

[The BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)
