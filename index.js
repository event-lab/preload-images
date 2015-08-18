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
    cheerio = require('cheerio'),

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

var cwd = process.cwd();
htmlFinder(log, cwd, function (file, data) {
    log.info('processing', file);
    var html = data.toString();
    var $ = cheerio.load(html);
    $('img[data-preload]').each(function (index, img) {
        var dataPreload = img.attribs['data-preload'];
        var src = img.attribs.src;
        if (path.join(path.dirname(dataPreload), 'preload') !== path.dirname(src)) { // not built
            var absolutePath = path.join(path.dirname(file), src);
            log.info('compressing', absolutePath);
            var directoryPath = path.join(path.dirname(absolutePath), 'preload');
            var preloadImagePath = directoryPath + '/' + path.basename(absolutePath);
            try {
                fs.mkdir(directoryPath, function (err) {
                    if (err && err.code !== 'EEXIST') {
                        log.error(err);
                    } else {
                        images(absolutePath)
                            .size(160)
                            .save(preloadImagePath, {
                                quality: 10
                            });
                    }
                });
            } catch (err) {
                log.error(err);
            }
            log.info('compressed', absolutePath);
            log.debug(path.relative(path.dirname(file), absolutePath));
            log.debug(path.relative(path.dirname(file), preloadImagePath));
            img.attribs.src = path.relative(path.dirname(file), absolutePath);
            img.attribs['data-preload'] = path.relative(path.dirname(file), preloadImagePath);
        }
    });
    fs.writeFile(file, $.html(), function (err) {
        if (err) {
            log.error(err);
        } else {
            log.info('html built', file);
        }
    });
});
