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
    commander = require('commander'),

    htmlFinder = require('./lib/html-finder'),

    cwd = process.cwd(),
    scriptString = "<script>Array.prototype.forEach.call(document.querySelectorAll('img[data-preload]'), function (img) { var fullSrc = img.dataset.preload, fullImg = new Image(); fullImg.addEventListener('load', function () { img.src = fullSrc;}, false); fullImg.src = fullSrc;});</script>";

commander
    .version(require('./package.json').version, '-v --version')
    .option('-w, --width <n>', 'set width', parseInt)
    .option('-q, --quality <n>', 'set quality', parseInt)
    .option('-d, --debug', 'debug mode')
    .parse(process.argv);

var log = new Log(commander.debug ? 7 : 5),
    width = commander.width || 160,
    quality = commander.quality || 10;

log.info('width', width);
log.info('quality', quality);

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
                            .size(width)
                            .save(preloadImagePath, {
                                quality: quality
                            });
                    }
                });
            } catch (err) {
                log.error(err);
            }
            log.info('compressed', absolutePath);
            log.debug(path.relative(path.dirname(file), absolutePath));
            log.debug(path.relative(path.dirname(file), preloadImagePath));
            img.attribs['data-preload'] = path.relative(path.dirname(file), absolutePath);
            img.attribs.src = path.relative(path.dirname(file), preloadImagePath);
        } else {
            log.info('already built from', dataPreload, 'to', src);
        }
    });
    if (!~html.indexOf(scriptString)) {
        $('body').append(scriptString);
        log.info('script appended', file);
    }
    fs.writeFile(file, $.html(), function (err) {
        if (err) {
            log.error(err);
        } else {
            log.notice('html built', file);
        }
    });
});
