/**
 * @since 15-08-18 15:39
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),
    path = require('path'),

    images = require('images'),

    imageBuilder = function (log, htmlFile, img, options) {
        var dataPreloadSrc = img.attribs['data-preload'],
            src = img.attribs.src;
        if (path.join(path.dirname(dataPreloadSrc), 'preload') !== path.dirname(src)) { // not built
            var fileDirectoryName = path.dirname(htmlFile),
                absolutePath = path.join(fileDirectoryName, src),
                directoryPath = path.join(path.dirname(absolutePath), 'preload'),
                preloadImagePath = path.join(directoryPath, path.basename(absolutePath));
            try {
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath);
                }
                images(absolutePath)
                    .size(options.width)
                    .save(preloadImagePath, {
                        quality: options.quality
                    });
                img.attribs['data-preload'] = path.relative(fileDirectoryName, absolutePath);
                img.attribs.src = path.relative(fileDirectoryName, preloadImagePath);
                log.notice('image compressed from', img.attribs['data-preload'], 'to', img.attribs.src);
            } catch (err) {
                log.error(err);
            }
        } else {
            log.notice('already compressed from', dataPreloadSrc, 'to', src);
        }
    };

module.exports = imageBuilder;
