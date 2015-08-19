#!/usr/bin/env node
/**
 * @since 150130 17:29
 * @author vivaxy
 * @inspired-by haoyang.li
 */
'use strict';

var fs = require('fs'),

    Log = require('log'),
    cheerio = require('cheerio'),
    commander = require('commander'),

    htmlFinder = require('./lib/html-finder'),
    imageBuilder = require('./lib/image-builder'),

    cwd = process.cwd(),
    scriptString = "<script data-preload>Array.prototype.forEach.call(document.querySelectorAll('img[data-preload]'), function (img) { var fullSrc = img.dataset.preload, fullImg = new Image(); fullImg.addEventListener('load', function () { img.src = fullSrc;}, false); fullImg.src = fullSrc;});</script>";

commander
    .option('-w, --width <n>', 'set preview image width', parseInt)
    .option('-q, --quality <n>', 'set preview image quality', parseInt)
    .option('-d, --debug', 'debug mode')
    .version(require('./package.json').version, '-v, --version')
    .parse(process.argv);

var log = new Log(commander.debug ? 7 : 5),
    option = {
        width: commander.width || 160,
        quality: commander.quality || 10
    };

log.notice('image compression width', option.width);
log.notice('image compression quality', option.quality);

htmlFinder(log, cwd, function (htmlFile, data) {
    log.info('processing', htmlFile);
    var html = data.toString(),
        $ = cheerio.load(html, {
            decodeEntities: false
        });
    // fix html not right problem
    html = $.html();
    $('img[data-preload]').each(function (index, img) {
        imageBuilder(log, htmlFile, img, option);
    });
    if ($.html() !== html) {
        if (!$('script[data-preload]').length) {
            $('body').append(scriptString);
            log.info('script appended', htmlFile);
        }
        fs.writeFile(htmlFile, $.html(), function (err) {
            if (err) {
                log.error(err);
            } else {
                log.notice('html saved', htmlFile);
            }
        });
    } else {
        log.info('html not containing preload image', htmlFile);
        // todo output results
    }
});
