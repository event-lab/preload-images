/**
 * @since 15-08-17 16:06
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),
    path = require('path'),

    q = require('q'),

    htmlFinder = function (root, callback) {
        var readdir = function (callback) {
            q.nfcall(fs.readdir, root)
                .then(callback);
        };
        readdir
            .then(function (files) {
                files.forEach(function (file) {
                    var fullFileName = path.join(root, file);
                    if (path.extname(fullFileName) === '.html') {
                        q.nfcall(fs.readFile, fullFileName)
                            .then(function (data) {
                                console.log(data);
                            }, function (err) {
                                console.log(err);
                            });
                    }

                });
            }, function (err) {
                console.log(err);
            });
    };

module.exports = htmlFinder;
