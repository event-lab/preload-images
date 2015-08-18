# preload-images

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Dependency Status][david-image]][david-url]

[![NPM][nodei-image]][nodei-url]

build preload images for events

## installation

`sudo npm install -g preload-images`

## usage

In your local folder, `> preload`.

This will change html:

`<img src="some.jpg" data-preload="">` to `<img src="some-small.jpg" data-preload="some.jpg">`

and add a script to to bottom of html body

## advanced usage

### show helps

`preview -h`

or

`preview --help`

### set image width

`preview -w 160`

or

`preview --width 160`

### set image quality

`preview -q 10`

or

`preview --quality 10`

### debug mode

`preview -d`

or

`preview --debug`

### show version

`preview -v`

or

`preview --version`

[npm-version-image]: http://img.shields.io/npm/v/preload-images.svg?style=flat
[npm-url]: https://www.npmjs.com/package/preload-images
[npm-downloads-image]: http://img.shields.io/npm/dm/preload-images.svg?style=flat
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[david-image]: http://img.shields.io/david/vivaxy/local-images.svg?style=flat
[david-url]: https://david-dm.org/vivaxy/local-images
[nodei-image]: https://nodei.co/npm-dl/preload-images.png?height=3
[nodei-url]: https://nodei.co/npm/preload-images/
