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
   * @param {object} params.ari The ari library
   * @param {object} params.event The stasis start event
   * @param {string} params.event.channel.id The id of the incoming channel
   * @returns {Promise}
   **/
  execute(params) {
    const {
      ari: { api },
      event: {
        channel: { id: channelId },
      },
    } = params;
    log.debug({ channelId }, 'executing ari music on hold');

    return api.channels.answer({ channelId }).then(() => {
      return api.channels.startMusicOnHold({ channelId });
    });
  },
};
