'use strict';
const config = require('config');
const log = require('./log');
const AGI = require('./vendor/digium-agi');
const ARI = require('ari-client');
const ariActions = require('./actions/ari');
const agiActions = require('./actions/agi');

AGI.createServer(config.port, connection => {

  connection.on('error', err => {
    log.error({ err }, 'AGI connection error');
  });

  connection.on('close', evt => {
    log.debug({ evt }, 'AGI connection closed');
  });

  const { variables } = connection;
  log.debug({ variables }, 'new AGI connection');

  if (variables.agi_extension === 300) {
    agiActions.musicOnHold.execute(connection);
  } else {
    const applicationName = ariActions[0].name;
    agiActions.putInStasis.execute(connection, applicationName);
  }
});

const { baseUrl, user, password } = config.ari;

ARI.connect(baseUrl, user, password).then(ari => {
  const applications = ariActions.map(action => action.name);

  return ari.start(applications).then(() => {
    ari.on('StasisStart', (event, channel) => {
      const action = ariActions.find(action => {
        return action.name === event.application;
      });

      if (!action) {
        log.warn({ event }, 'No matching action for StasisStart event');
        return;
      }

      action.execute({ ari, event, channel }).catch(err => {
        log.error({ err }, 'ARI action encountered an error');
      });
    });
  });
}).catch(err => {
  log.fatal({ err }, 'ARI encountered an error');
  process.nextTick(() => { throw err; });
});

log.debug(`AGI server listening on port ${config.port}`);
