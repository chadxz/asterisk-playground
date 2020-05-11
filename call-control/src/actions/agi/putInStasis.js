'use strict';
const log = require('../../log');

module.exports = {
  /**
   * Place the channel into stasis and execute the provided application
   *
   * @param {object} connection The agi connection
   * @param {string} applicationName The application to invote in ARI
   * @param {*} args The arguments to pass to the application
   * @returns {Promise}
   */
  async execute(connection, applicationName, ...args) {
    log.debug('placing channel into stasis');

    const params = `"${[applicationName, ...args].concat(',')}"`;
    await connection.exec('Stasis', params);
  },
};
