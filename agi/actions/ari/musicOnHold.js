'use strict';
const log = require('../../log');

module.exports = {

  /**
   * The ari application name
   */
  name: 'ariMusicOnHold',

  /**
   * Play music on hold indefinitely
   *
   * @param {object} params
   * @param {object} params.connection The ari connection
   * @param {object} params.event The stasis start event
   * @param {object} params.channel The channel that was put in stasis
   * @returns {Promise}
   **/
  execute(params) {
    const { event, channel } = params;
    log.debug({ event }, 'executing ari music on hold');

    return channel.answer().then(() => {
      return channel.startMoh();
    });
  }
};
