# preload-images

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Dependency Status][david-image]][david-url]

[![NPM][nodei-image]][nodei-url]

build preload images for events

## installation

`[sudo] npm install -g preload-images`

## usage

In your project folder, `preload`.

This will change your html files to:

`<img src="some.jpg" data-preload>` to `<img src="some-small.jpg" data-preload="some.jpg" data-preload-origin="some.jpg">`

And add a script `<script data-preload="">` to the bottom of html body.

## advanced usage

### show helps

`preload -h`

or

`preload --help`

### set image width

default width 160

`preload -w 160`

or

`preload --width 160`

### set image quality

default quality 10

`preload -q 10`

or

`preload --quality 10`

### specify html file

`preload -f ./index.html`

or

`preload --file ./index.html`

### debug mode

`preload -d`

or

`preload --debug`

### show version

`preload -v`

or

`preload --version`

[npm-version-image]: http://img.shields.io/npm/v/preload-images.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/preload-images
[npm-downloads-image]: http://img.shields.io/npm/dm/preload-images.svg?style=flat-square
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
[david-image]: http://img.shields.io/david/event-lab/preload-images.svg?style=flat-square
[david-url]: https://david-dm.org/event-lab/preload-images
[nodei-image]: https://nodei.co/npm-dl/preload-images.png?height=3
[nodei-url]: https://nodei.co/npm/preload-images/
