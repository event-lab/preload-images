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

In your local folder, `> preload`.

This will change html:

`<img src="some.jpg" data-preload="">` to `<img src="some-small.jpg" data-preload="some.jpg">`

and add a script to the bottom of html body

## advanced usage

### show helps

`preload -h`

or

`preload --help`

### set image width

`preload -w 160`

or

`preload --width 160`

### set image quality

`preload -q 10`

or

`preload --quality 10`

### debug mode

`preload -d`

or

`preload --debug`

### show version

`preload -v`

or

`preload --version`

[npm-version-image]: http://img.shields.io/npm/v/preload-images.svg?style=flat
[npm-url]: https://www.npmjs.com/package/preload-images
[npm-downloads-image]: http://img.shields.io/npm/dm/preload-images.svg?style=flat
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[david-image]: http://img.shields.io/david/vivaxy/preload-images.svg?style=flat
[david-url]: https://david-dm.org/vivaxy/preload-images
[nodei-image]: https://nodei.co/npm-dl/preload-images.png?height=3
[nodei-url]: https://nodei.co/npm/preload-images/
