'use strict';

const bunyan = require('bunyan');
const { name } = require('../package.json');
const bformat = require('bunyan-format');
const config = require('config');

function createLogger() {
  const { pretty, color, level } = config.log;

  const stream = pretty ? bformat({ color, outputMode: 'short' }) : process.stdout;

  const useStream = level !== 'silent';

  return bunyan.createLogger({
    name,
    streams: useStream ? [{ level, stream }] : [],
    serializers: {
      err(err) {
        if (typeof err === 'string') {
          return { message: err };
        }

        const result = bunyan.stdSerializers.err(err);
        // log any enumerable properties not grabbed by bunyan
        if (err && typeof err === 'object') {
          Object.keys(err).forEach((key) => {
            if (key !== 'error@context' && !result[key]) {
              result[key] = err[key];
            }
          });
        }

        return result;
      },
    },
  });
}

const log = createLogger();

if (config.log.logUncaughtException) {
  process.on('uncaughtException', (err) => {
    log.fatal({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

module.exports = log;
