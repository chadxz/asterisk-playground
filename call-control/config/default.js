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
    baseUrl: 'http://localhost:8088',
    user: 'asterisk',
    password: 'asterisk'
  }
};
