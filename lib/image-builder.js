/**
 * @since 15-08-18 15:39
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),
    path = require('path'),

    log = require('log-util'),
    images = require('images'),

    imageBuilder = function (htmlFile, img, options, callback) {
        // attributes
        var src = img.attribs.src,
            dataPreloadOrigin = img.attribs['data-preload-origin'],
            originalSource = dataPreloadOrigin || src,

        // html
            htmlDirectory = path.dirname(htmlFile),

        // image
            imageFileName = path.basename(originalSource),
            originalImageAbsolutePath = path.join(htmlDirectory, originalSource),
            preloadImageAbsoluteDirectory = path.join(path.dirname(originalImageAbsolutePath), 'preload'),
            preloadImageAbsolutePath = path.join(preloadImageAbsoluteDirectory, imageFileName);
        try {
            if (!fs.existsSync(preloadImageAbsoluteDirectory)) {
                fs.mkdirSync(preloadImageAbsoluteDirectory);
            }
            images(originalImageAbsolutePath)
                .size(options.width)
                .save(preloadImageAbsolutePath, {
                    quality: options.quality
                });
            img.attribs['data-preload-origin'] = originalSource;
            img.attribs['data-preload'] = path.relative(htmlDirectory, originalImageAbsolutePath);
            img.attribs.src = path.relative(htmlDirectory, preloadImageAbsolutePath);
            log.debug('image compressed from', originalSource, 'to', img.attribs.src);
            callback && callback();
        } catch (err) {
            log.error(err);
        }
    };

module.exports = imageBuilder;
