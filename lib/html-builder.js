/**
 * @since 15-08-20 11:07
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),

    htmlBuilder = function (log, htmlFile, $) {
        fs.writeFile(htmlFile, $.html(), function (err) {
            if (err) {
                log.error(err);
            } else {
                log.info('html saved', htmlFile);
            }
        });
    };

module.exports = htmlBuilder;
