/**
 * @since 15-08-17 16:06
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),
    path = require('path'),

    excludedDirectories = require('./excluded-directories'),

    walker = function (log, root, callback) {
        if (~excludedDirectories.indexOf(path.basename(root))) {
            log.debug('excluded directory', root);
        } else {
            fs.readdir(root, function (err, files) {
                if (err) {
                    log.error(err);
                } else {
                    files.forEach(function (file) {
                        var fullFileName = path.join(root, file);
                        fs.stat(fullFileName, function (err, stats) {
                            if (err) {
                                log.error(err);
                            } else {
                                if (stats.isFile()) {
                                    if (path.extname(fullFileName) === '.html') {
                                        fs.readFile(fullFileName, 'utf-8', function (err, data) {
                                            if (err) {
                                                log.error(err);
                                            } else {
                                                callback(fullFileName, data);
                                            }
                                        });
                                    } else {
                                        log.debug('not html', fullFileName);
                                    }
                                } else if (stats.isDirectory()) {
                                    walker(log, fullFileName, callback);
                                } else {
                                    log.debug('not file or directory', fullFileName);
                                }
                            }
                        });
                    });
                }
            });
        }
    };

module.exports = walker;
