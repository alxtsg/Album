# Album #

## Description ##

Static album page generation tool.

## Requirements ##

* Node.js (`>=18`).
* ImageMagick (`7.x`).

## Installation ##

0. `npm clean-install --omit=dev`.

ImageMagick should be installed and `magick` is added to the `PATH` environment
variable. To validate the installation, run:

```
magick -version
```

The version and build information should be printed.

## Configuration ##

Create a configuration file with the name `.env` in the installation directory.
The configuration file controls the following:

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
