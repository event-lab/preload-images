/**
 * @since 15-08-17 16:06
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),
    path = require('path'),

    q = require('q'),

    excludedDirectories = require('./excluded-directories'),

    walker = function (log, root, callback) {
        if (~excludedDirectories.indexOf(path.basename(root))) {
            return log.info(root, 'excluded directory');
        } else {
            return q.nfcall(fs.readdir, root)
                .then(function (files) {
                    return files.forEach(function (file) {
                        var fullFileName = path.join(root, file);
                        return q.nfcall(fs.stat, fullFileName)
                            .then(function (stats) {
                                if (stats.isFile()) {
                                    if (path.extname(fullFileName) === '.html') {
                                        return q.nfcall(fs.readFile, fullFileName, 'utf-8')
                                            .then(function (data) {
                                                return callback(fullFileName, data);
                                            }, function (err) {
                                                return log.error(fullFileName, err);
                                            });
                                    } else {
                                        return log.debug(fullFileName, 'is not html');
                                    }
                                } else if (stats.isDirectory()) {
                                    return walker(log, fullFileName, callback);
                                } else {
                                    return log.debug(fullFileName, 'is not file or directory');
                                }
                            }, function (err) {
                                return log.debug(fullFileName, err);
                            });
                    });
                }, function (err) {
                    return log.error(root, err);
                });
        }
    };

module.exports = walker;
