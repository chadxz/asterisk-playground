'use strict';
const log = require('../../log');

/**
 * Play silence to a channel
 *
 * @param {object} params
 * @param {object} params.ari The ari client
 * @param {object} params.channel The channel to play silence to
 * @param {number} params.seconds The number of seconds to play silence
 */
function playSilence(params) {
  return new Promise((resolve, reject) => {
    const { ari, channel, seconds } = params;

    const playback = ari.Playback();

    function playbackFinished() {
      resolve();
    }

    playback.once('PlaybackFinished', playbackFinished);

    channel.play({
      media: `sound:silence/${seconds}`
    }, playback).catch(err => {
      log.error({ err }, 'An error occurred playing silence to the channel');
      playback.removeListener('PlaybackFinished', playbackFinished);
      reject();
    });
  });
}


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
    const { ari, event, channel } = params;
    log.debug({ event }, 'executing ari music on hold');

    return channel.answer().then(() => {
      return playSilence({ ari, channel, seconds: 4 });
    }).then(() => {
      return channel.startMoh();
    });
  }
};
