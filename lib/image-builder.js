/* eslint-disable */

/**
 * @since 15-08-18 15:39
 * @author vivaxy
 */

'use strict';

var fs = require('fs');
var path = require('path');

var Jimp = require('jimp');
var log = require('log-util');

var normalizePath = function (_path) {
    var __path = path.normalize(_path);
    
    if (path.sep === '\\') {
        __path = __path.replace(/\\/g, '/');
    }
    return __path;
    // or single line with:
    // return path.normalize(_path).replace(new RegExp('\\' + path.sep, 'g'), '/');
};

var imageBuilder = function (htmlFile, img, options, callback) {
    // attributes
    var src = img.attribs.src;
    var dataPreloadOrigin = img.attribs['data-preload-origin'];
    var originalSource = dataPreloadOrigin || src;
    // html
    var htmlDirectory = path.dirname(htmlFile);
    // image
    var imageFileName = path.basename(originalSource); // image file name
    var originalImageAbsolutePath = path.join(htmlDirectory, originalSource); // original image absolute path
    var preloadImageAbsoluteDirectory = path.join(path.dirname(originalImageAbsolutePath), 'preload'); // preload image absolute path
    var preloadImageAbsolutePath = path.join(preloadImageAbsoluteDirectory, imageFileName); // preload image absolute path

    if (!fs.existsSync(preloadImageAbsoluteDirectory)) { // directory not found
        fs.mkdirSync(preloadImageAbsoluteDirectory);
    }
    if (!fs.existsSync(originalImageAbsolutePath)) {
        log.error('image not exists', htmlFile, originalSource);
    } else {
        new Jimp(originalImageAbsolutePath, function (err, image) {
            var bitmap = image.bitmap;
            var width = options.width;
            var height = bitmap.height * width / bitmap.width;
            image
                .resize(width, height)
                .quality(options.quality)
                .write(preloadImageAbsolutePath);
        });

        img.attribs['data-preload-origin'] = normalizePath(originalSource);
        img.attribs['data-preload'] = normalizePath(path.relative(htmlDirectory, originalImageAbsolutePath));
        img.attribs.src = normalizePath(path.relative(htmlDirectory, preloadImageAbsolutePath));
        log.debug('image compressed from', originalSource, 'to', img.attribs.src);
        callback && callback();
    }
};

module.exports = imageBuilder;
