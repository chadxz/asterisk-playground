'use strict';
const config = require('config');
const log = require('./log');
const AGI = require('./vendor/digium-agi');

AGI.createServer(config.port, conn => {

    conn.on('error', err => {
        log.error({ err }, 'AGI connection error');
    });

    conn.on('close', evt => {
        log.debug({ evt }, 'AGI connection closed');
    });

    const { variables } = conn;
    log.debug({ variables }, 'new AGI connection');

    conn.answer().then(() => {
        return conn.exec('PLAYBACK transfer');
    }).then(() => {
        return conn.exec('MUSICONHOLD');
    }).catch(err => {
        log.error({ err }, 'Error processing AGI chain');
    });
});

log.debug(`AGI server listening on port ${config.port}`);
