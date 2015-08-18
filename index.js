#!/usr/bin/env node
/**
 * @since 150130 17:29
 * @author vivaxy
 */
'use strict';

/*
 * @Author: haoyang.li
 * @Date:   2015-08-07 11:42:26
 * @Last Modified by:   haoyang.li
 * @Last Modified time: 2015-08-17 14:31:43
 */
var fs = require('fs'),
    path = require('path'),

    Log = require('log'),
    images = require('images'),

    log = new Log(7),

    htmlFinder = require('./lib/html-finder'),

// walk through html
// todo find `data-preload`
// todo save src
// todo build low resolution images
// todo replace `src` to low resolution image paths
// todo replace `data-preload` to high resolution image paths
// todo append script before `</body>`

    localPath = path.join(__dirname, './'),
    imagePath = localPath + 'css/img/origin/',
    originPath = localPath + 'css/img/changed/',

    explorer = function (imagePath) {
        fs.readdir(imagePath, function (err, files) {
            if (err) {
                console.log('error:\n' + err);
                return;
            }
            files.forEach(function (file) {
                fs.stat(imagePath + '/' + file, function (err, stat) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (stat.isDirectory()) {
                        // explorer(imagePath + '/' + file);
                    } else {
                        if (!fs.existsSync(originPath)) {
                            fs.mkdirSync(originPath);
                        }
                        if (file.match(/\.jpg/)) {
                            images(imagePath + '/' + file)
                                .size(160)
                                .save(originPath + file, {
                                    quality: 10
                                });
                            console.log(file + "change success;");
                        }
                    }
                });
            });
        });
    };

//explorer(imagePath);

htmlFinder(log, '.', function (file, data) {
    console.log('----------------', file, 'found');
});
