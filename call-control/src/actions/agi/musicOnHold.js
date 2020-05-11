'use strict';
const log = require('../../log');

module.exports = {
  /**
   * Play music on hold indefinitely
   *
   * @param {object} connection The agi connection
   * @returns {Promise}
   **/
  async execute(connection) {
    log.debug('executing agi music on hold');

    await connection.answer();
    await connection.exec('PLAYBACK silence/3');
    await connection.exec('MUSICONHOLD');
  },
};
