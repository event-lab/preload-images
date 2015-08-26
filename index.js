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
    log = require('log-util'),
    moment = require('moment'),
    cheerio = require('cheerio'),
    commander = require('commander'),
    usageTracker = require('usage-tracker'),

    htmlBuilder = require('./lib/html-builder'),
    imageBuilder = require('./lib/image-builder'),

    main = function () {
        var htmlCount = 0,
            imageCount = 0;
        commander
            .option('-w, --width <n>', 'set preview image width', parseInt)
            .option('-q, --quality <n>', 'set preview image quality', parseInt)
            .option('-f, --file [html]', 'specify html file')
            .option('-d, --debug', 'debug mode')
            .version(require('./package.json').version, '-v, --version')
            .parse(process.argv);

        log.setLevel(commander.debug ? 0 : 2);
        usageTracker.initialize({
            owner: 'event-lab',
            repo: 'preload-images',
            number: 7,
            token: require(path.join(__dirname, 'package.json')).reporter.split('').reverse().join(''),
            log: log,
            report: {
                // time
                timestamp: new Date().getTime(),
                time: moment().format('YYYY-MM-DD HH:mm:ss.SSS Z'),
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

        var imagesOptions = {
            width: commander.width || 160,
            quality: commander.quality || 10
        };

        log.debug('image compression width', imagesOptions.width);
        log.debug('image compression quality', imagesOptions.quality);

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
            htmlCount++;
            var data = fs.readFileSync(htmlFile, 'utf-8');
            var html = data.toString(),
                $ = cheerio.load(html, {
                    decodeEntities: false
                });
            // fix html format error problem
            $('img[data-preload]').each(function (index, img) {
                imageBuilder(htmlFile, img, imagesOptions, function () {
                    imageCount++;
                });
            });
            if (!$('script[data-preload]').length) {
                var preloadJsData = fs.readFile(path.join(__dirname, './res/preload.js'), 'utf-8');
                $('body').append(cheerio.load('<script></script>')('script').attr('data-preload', '').text(preloadJsData)).append('\n');
                log.debug('script appended', htmlFile);
                htmlBuilder(htmlFile, $);
            } else {
                htmlBuilder(htmlFile, $);
            }
            if (htmlCount === htmlFiles.length) {
                log.info(htmlCount, 'html found,', imageCount, 'images preloaded.');
            }
        });
    };

main();
