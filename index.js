#!/usr/bin/env node
/**
 * @since 150130 17:29
 * @author vivaxy
 * @inspired-by haoyang.li
 */
'use strict';

var fs = require('fs'),
    path = require('path'),

    glob = require('glob'),
    Log = require('log-util'),
    cheerio = require('cheerio'),
    commander = require('commander'),
    UsageTracker = require('usage-tracker'),

    htmlBuilder = require('./lib/html-builder'),
    imageBuilder = require('./lib/image-builder'),

    main = function () {
        commander
            .option('-w, --width <n>', 'set preview image width', parseInt)
            .option('-q, --quality <n>', 'set preview image quality', parseInt)
            .option('-f, --file [html]', 'specify html file')
            .option('-d, --debug', 'debug mode')
            .version(require('./package.json').version, '-v, --version')
            .parse(process.argv);

        var log = new Log(commander.debug ? 0 : 2),
            imagesOptions = {
                width: commander.width || 160,
                quality: commander.quality || 10
            },
            usageTracker = new UsageTracker({
                owner: 'event-lab',
                repo: 'preload-images',
                number: 7,
                token: '8b76d34defde2774cc0bf9b2a22eb936ecb1b09a',
                log: log,
                report: {
                    // time
                    timestamp: new Date().getTime(),
                    time: new Date().toString(),
                    // process
                    arch: process.arch,
                    platform: process.platform,
                    version: process.version,
                    versions: process.versions,
                    argv: process.argv,
                    cwd: process.cwd()
                }
            });

        usageTracker.send({
            // event
            event: 'used'
        });

        log.info('image compression width', imagesOptions.width);
        log.info('image compression quality', imagesOptions.quality);

        var htmlFiles = [];
        switch (commander.file) {
            case undefined:
                htmlFiles = glob.sync('./**/*.html', {
                    ignore: [
                        './**/node_modules/**',
                        './**/.git/**',
                        './**/.idea/**'
                    ]
                });
                break;
            case true:
                htmlFiles = ['./index.html'];
                break;
            default:
                htmlFiles = [commander.file];
                break;
        }

        log.debug('html found', htmlFiles.join(', '));
        htmlFiles.forEach(function (htmlFile) {
            fs.readFile(htmlFile, 'utf-8', function (err, data) {
                if (err) {
                    log.error(err);
                } else {
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
                }
            });
        });
    };

main();
