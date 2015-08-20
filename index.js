#!/usr/bin/env node
/**
 * @since 150130 17:29
 * @author vivaxy
 * @inspired-by haoyang.li
 */
'use strict';

var fs = require('fs'),
    path = require('path'),

    Log = require('log-util'),
    cheerio = require('cheerio'),
    commander = require('commander'),

    htmlFinder = require('./lib/html-finder'),
    htmlBuilder = require('./lib/html-builder'),
    imageBuilder = require('./lib/image-builder'),

    cwd = process.cwd();

commander
    .option('-w, --width <n>', 'set preview image width', parseInt)
    .option('-q, --quality <n>', 'set preview image quality', parseInt)
    .option('-d, --debug', 'debug mode')
    .version(require('./package.json').version, '-v, --version')
    .parse(process.argv);

var log = new Log(commander.debug ? 0 : 2),
    imagesOptions = {
        width: commander.width || 160,
        quality: commander.quality || 10
    };

log.info('image compression width', imagesOptions.width);
log.info('image compression quality', imagesOptions.quality);

htmlFinder(log, cwd, function (htmlFile, data) {
    log.info('html found', htmlFile);
    var html = data.toString(),
        $ = cheerio.load(html, {
            decodeEntities: false
        });
    // fix html format error problem
    $('img[data-preload]').each(function (index, img) {
        imageBuilder(log, htmlFile, img, imagesOptions);
    });
    if (!$('script[data-preload]').length) {
        fs.readFile(path.join(__dirname, './res/preload.js'), 'utf-8', function (err, data) {
            if (err) {
                log.error(err);
            } else {
                $('body').append(cheerio.load('<script></script>')('script').attr('data-preload', '').text(data)).append('\n');
                log.info('script appended', htmlFile);
                htmlBuilder(log, htmlFile, $);
            }
        });
    } else {
        htmlBuilder(log, htmlFile, $);
    }
});
