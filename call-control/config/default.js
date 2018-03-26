'use strict';

module.exports = {
  port: 4573,
  log: {
    logUncaughtException: true,
    pretty: true,
    level: 'debug',
    color: true
  },
  ari: {
    host: 'localhost:8088',
    username: 'asterisk',
    password: 'asterisk'
  }
};
