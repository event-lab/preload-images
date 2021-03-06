#!/usr/bin/env node

/**
 * @since 150130 17:29
 * @author vivaxy
 * @inspired-by haoyang.li
 */

'use strict';

var fs = require('fs');
var path = require('path');

var glob = require('glob');
var log = require('log-util');
var cheerio = require('cheerio');
var commander = require('commander');
var usageTracker = require('usage-tracker');

var htmlBuilder = require('./lib/html-builder');
var imageBuilder = require('./lib/image-builder');

var packageJson = require('./package.json');

var DEFAULT_WIDTH = 160;
var DEFAULT_QUALITY = 10;

var main = function () {  // eslint-disable-line max-statements

    // init arguments
    commander
        .option('-w, --width <n>', 'set preview image width', parseInt)
        .option('-q, --quality <n>', 'set preview image quality', parseInt)
        .option('-f, --file <html>', 'specify html file')
        .option('-d, --debug', 'debug mode')
        .version(packageJson.version, '-v, --version')
        .parse(process.argv);

    // init log
    log.setLevel(commander.debug ? 0 : 2);

    // report error
    process.on('uncaughtException', function (e) {
        new usageTracker.UsageTracker({
            owner: 'event-lab',
            repo: 'preload-images',
            number: 8,
            token: packageJson['usage-tracker-id'].split('').reverse().join(''),
            report: {
                'preload-image-version': packageJson.version
            }
        }).on('end', function () {
            process.exit(1); // eslint-disable-line no-process-exit
        }).on('err', function () {
            process.exit(1); // eslint-disable-line no-process-exit
        }).send({
            // JSON.stringify(err) will convert err to `{}`
            // use error.stack for more details
            error: e.stack.split('\n')
        });
        // throw this to preserve default behaviour
        // console this instead of throw error to keep the original error trace
        log.error(e.stack);
        // still exit as uncaught exception
    });

    // main
    var htmlCount = 0;
    var imageCount = 0;
    var globString = commander.file || './**/*.html';
    var imagesOptions = {
        width: commander.width || DEFAULT_WIDTH,
        quality: commander.quality || DEFAULT_QUALITY
    };
    var htmlFiles = glob.sync(globString, {
        ignore: [
            './**/node_modules/**',
            './**/.git/**',
            './**/.idea/**'
        ]
    });

    log.debug('image compression width', imagesOptions.width);
    log.debug('image compression quality', imagesOptions.quality);

    if (htmlFiles.length === 0) {
        log.error('html not found', globString);
        process.exit(1); // eslint-disable-line no-process-exit
    }
    log.debug('html found', htmlFiles.join(', '));
    htmlFiles.forEach(function (htmlFile) { // eslint-disable-line max-statements
        var data = fs.readFileSync(htmlFile, 'utf-8'); // eslint-disable-line no-sync
        var html = data.toString();
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        var $images = $('img[data-preload]');

        if ($images.length > 0) {
            $images.each(function (index, img) {
                imageBuilder(htmlFile, img, imagesOptions, function () {
                    imageCount++;
                });
            });
            if (!$('script[data-preload]').length) {
                var preloadJsData = fs.readFileSync(path.join(__dirname, './res/preload.js'), 'utf-8'); // eslint-disable-line no-sync, max-len

                $('body').append(cheerio.load('<script></script>')('script').attr('data-preload', '').text(preloadJsData)).append('\n'); // eslint-disable-line max-len
                log.debug('script appended', htmlFile);
                htmlBuilder(htmlFile, $);
            } else {
                htmlBuilder(htmlFile, $);
            }
            htmlCount++;
        }
    });
    log.info(htmlFiles.length, 'html found,', htmlCount, 'html built,', imageCount, 'images preloaded');
};

main();
