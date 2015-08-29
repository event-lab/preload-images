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
    cheerio = require('cheerio'),
    commander = require('commander'),
    usageTracker = require('usage-tracker'),

    htmlBuilder = require('./lib/html-builder'),
    imageBuilder = require('./lib/image-builder'),

    main = function () {

        commander
            .option('-w, --width <n>', 'set preview image width', parseInt)
            .option('-q, --quality <n>', 'set preview image quality', parseInt)
            .option('-f, --file <html>', 'specify html file')
            .option('-d, --debug', 'debug mode')
            .version(require('./package.json').version, '-v, --version')
            .parse(process.argv);

        log.setLevel(commander.debug ? 0 : 2);
        usageTracker.initialize({
            owner: 'event-lab',
            repo: 'preload-images',
            number: 7,
            token: require('./package.json').reporter.split('').reverse().join(''),
            log: log,
            report: {
                'preload-image-version': require('./package.json').version
            }
        });
        process.on('uncaughtException', function (err) {
            usageTracker.send({
                // error
                // JSON.stringify(err) will convert err to `{}`
                error: err.toString()
            });
        });
        usageTracker.send({
            // event
            event: 'used'
        });
        
        var htmlCount = 0,
            imageCount = 0,
            globString = commander.file || './**/*.html',
            imagesOptions = {
                width: commander.width || 160,
                quality: commander.quality || 10
            },
            htmlFiles = glob.sync(globString, {
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
            process.exit(1);
        }
        log.debug('html found', htmlFiles.join(', '));
        htmlFiles.forEach(function (htmlFile) {
            var data = fs.readFileSync(htmlFile, 'utf-8'),
                html = data.toString(),
                $ = cheerio.load(html, {
                    decodeEntities: false
                }),
                $images = $('img[data-preload]');
            if ($images.length > 0) {
                $images.each(function (index, img) {
                    imageBuilder(htmlFile, img, imagesOptions, function () {
                        imageCount++;
                    });
                });
                if (!$('script[data-preload]').length) {
                    var preloadJsData = fs.readFileSync(path.join(__dirname, './res/preload.js'), 'utf-8');
                    $('body').append(cheerio.load('<script></script>')('script').attr('data-preload', '').text(preloadJsData)).append('\n');
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
