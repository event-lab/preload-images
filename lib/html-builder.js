/**
 * @since 15-08-20 11:07
 * @author vivaxy
 */
'use strict';
var fs = require('fs'),

    log = require('log-util'),

    htmlBuilder = function(htmlFile, $) {
        fs.writeFileSync(htmlFile, $.html());
        log.debug('html saved', htmlFile);
    };

module.exports = htmlBuilder;