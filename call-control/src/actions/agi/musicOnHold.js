'use strict';

const log = require('../../log');

module.exports = {
  /**
   * Play music on hold indefinitely
   *
   * @param {object} connection The agi connection
   * @returns {Promise}
   **/
  execute(connection) {
    log.debug('executing agi music on hold');

    return connection
      .answer()
      .then(() => {
        return connection.exec('PLAYBACK silence/3');
      })
      .then(() => {
        return connection.exec('MUSICONHOLD');
      });
  },
};
