'use strict';
const { filter } = require('rxjs/operators');
const config = require('config');
const log = require('./log');
const AGI = require('./vendor/digium-agi');
const ari = require('./ari');
const ariActions = require('./actions/ari');
const agiActions = require('./actions/agi');

AGI.createServer(config.port, (connection) => {
  connection.on('error', (err) => {
    log.error({ err }, 'AGI connection error');
  });

  connection.on('close', (evt) => {
    log.debug({ evt }, 'AGI connection closed');
  });

  const { variables } = connection;
  log.debug({ variables }, 'new AGI connection');

  if (variables.agi_extension === '300') {
    agiActions.musicOnHold.execute(connection);
  } else {
    const applicationName = ariActions[0].name;
    agiActions.putInStasis.execute(connection, applicationName);
  }
});

ari.events.pipe(filter((event) => event.type === 'StasisStart')).subscribe(
  (event) => {
    log.debug({ event }, 'Received StasisStart event');

    const action = ariActions.find((action) => {
      return action.name === event.application;
    });

    if (!action) {
      log.warn({ event }, 'No matching action for StasisStart event');
      return;
    }

    log.debug({ action }, 'Found corresponding action. executing...');
    action.execute({ ari, event }).catch((err) => {
      log.error({ err }, 'ARI action encountered an error');
    });
  },
  (err) => {
    log.fatal({ err }, 'ARI subscription encountered an error');
    process.nextTick(() => {
      throw err;
    });
  }
);

log.debug(`AGI server listening on port ${config.port}`);
