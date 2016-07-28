'use strict';
const bunyan = require('bunyan');
const name = require('./package.json').name;
const bformat = require('bunyan-format');
const config = require('config');

function createLogger({ level }) {
    const stream = config.log.pretty ?
        bformat({ outputMode: 'short' }) :
        process.stdout;

    const useStream = level !== 'silent';

    return bunyan.createLogger({
        name,
        streams: useStream ? [{ level, stream }] : []
    });
}

const log = createLogger({ level: config.log.level });

if (config.log.logUncaughtException) {
    process.on('uncaughtException', err => {
        log.fatal({ err }, 'Uncaught exception');
        process.exit(1);
    });
}

exports = module.exports = log;
