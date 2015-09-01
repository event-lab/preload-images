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
        // init arguments
        commander
            .option('-w, --width <n>', 'set preview image width', parseInt)
            .option('-q, --quality <n>', 'set preview image quality', parseInt)
            .option('-f, --file <html>', 'specify html file')
            .option('-d, --debug', 'debug mode')
            .version(require('./package.json').version, '-v, --version')
            .parse(process.argv);

        // init log
        log.setLevel(commander.debug ? 0 : 2);
        
        // init usage tracker
        usageTracker.initialize({
            owner: 'event-lab',
            repo: 'preload-images',
            number: 7,
            token: require('./package.json')['usage-tracker-id'].split('').reverse().join(''),
            log: log,
            report: {
                'preload-image-version': require('./package.json').version
            }
        });
        // report error
        process.on('uncaughtException', function (e) {
            new usageTracker.UsageTracker({
                owner: 'event-lab',
                repo: 'preload-images',
                number: 8,
                token: require('./package.json')['usage-tracker-id'].split('').reverse().join(''),
                report: {
                    'preload-image-version': require('./package.json').version
                }
            }).on('end', function () {
                    process.exit(1);
                }).on('err', function () {
                    process.exit(1);
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
        // report usage
        usageTracker.send({
            // event
            event: 'used'
        });

        // main
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
