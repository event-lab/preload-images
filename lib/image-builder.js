/**
 * @since 15-08-18 15:39
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),
    path = require('path'),

    images = require('images'),

    imageBuilder = function (log, htmlFile, img, options) {
        var src = img.attribs.src,
            dataPreloadOriginSrc = img.attribs['data-preload-origin'],
            originalSource = dataPreloadOriginSrc || src;
        var fileDirectoryName = path.dirname(htmlFile),
            absolutePath = path.join(fileDirectoryName, originalSource),
            directoryPath = path.join(path.dirname(absolutePath), 'preload'),
            preloadImagePath = path.join(directoryPath, path.basename(absolutePath));
        try {
            // todo use async methods
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }
            images(absolutePath)
                .size(options.width)
                .save(preloadImagePath, {
                    quality: options.quality
                });
            img.attribs['data-preload-origin'] = originalSource;
            img.attribs['data-preload'] = path.relative(fileDirectoryName, absolutePath);
            img.attribs.src = path.relative(fileDirectoryName, preloadImagePath);
            log.info('image compressed from', img.attribs['data-preload'], 'to', img.attribs.src);
        } catch (err) {
            log.error(err);
        }
    };

module.exports = imageBuilder;
