'use strict';
const awry = require('awry');
const Rx = require('rxjs/Rx');
const config = require('config');
const ariActions = require('./actions/ari');

const { host, username, password } = config.ari;
const restApiUrl = `http://${host}/ari`;
const eventsUrl = `ws://${host}/ari/events`;

module.exports = {
  events: Rx.Observable.create(observer => {
    const app = ariActions.map(action => action.name);
    const ws = awry.Events.connect({ url: eventsUrl, username, password, app });

    ws.on('message', observer.next.bind(observer));
    ws.on('error', observer.error.bind(observer));
    ws.on('close', observer.complete.bind(observer));

    // return value called upon subscription cancellation
    // to cleanup the observable's state.
    return ws.close.bind(ws);
  }).share(),

  api: new awry.API({ username, password, baseUrl: restApiUrl })
};
