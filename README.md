# Album #

## Description ##

Static album page generation tool.

## Requirements ##

* Node.js (`>=12`).
* GraphicsMagick (`>=1.3.36`).

## Installation ##

0. `npm clean-install --production`.

## Configuration ##

Create a configuration file with the name `.env`. The configuration file
controls the following:

* `GM_PATH`: Path of GraphicsMagick executable file.
  * If `gm` (for UNIX/ Linux system) or `gm.exe` is in the `PATH` environment
    variable, it is not necessary to specify the full path, the executable name
    itself is sufficient.
* `MAX_WIDTH`: Maximum width (in pixels) of each generated thumbnail.
* `MAX_HEIGHT`: Maximum height (in pixels) of each generated thumbnail.

An example `.env.template` is provided as a reference.

## Usage ##

Run:

```
node index.js <input-dir>
```

Command arguments:

* `<input-dir>`: A directory contains photos in JPEG format with EXIF data.

The following will be created in the specified directory:

* `index.html`: The generated webpage.
* `thumbnails`: The directory contains thumbnails of the photos. Each photo is
                resized if it is larger than the specified size.

## Examples ##

Assume there is a directory `/path/to/album-20170101` containing photos in JPEG
format with EXIF data:

```
node index.js /path/to/album-20170101
```

The generated webpage `index.html` and thumbnails directory `thumbnails` can be
found in the directory.

## Build ##

Before building, install dependencies and remove the old build:

```
npm clean-install
npm run clean
```

To build the project for release, run:

```
npm run build-release
```

The `dist` directory contains files ready for release.

To build the project for testing, run:

```
npm run build-test
```

The `dist` directory contains files ready for testing.

## Testing ##

Build the project for testing, navigate to the `dist` directory and run:

```
npm clean-install
npm run test
```

## License ##

[The BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)
