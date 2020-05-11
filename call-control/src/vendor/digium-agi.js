// This is an old fork of ding-dong, from NPM. Needs to be updated to something else.
'use strict';
var Readable = require('readable-stream');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('digium-agi');

var STATE = {
  init: 0,
  waiting: 2,
};

var Context = function (stream) {
  EventEmitter.call(this);

  // When a request is made, a Promise for the
  // response is created, and {promise,resolve,reject} is pushed onto
  // this array.  When the response is received from asterisk, the
  // [0] promise is shifted off the front and resolved.
  this.pendingResponses = [];

  this.stream = new Readable();
  this.stream.wrap(stream);
  this.state = STATE.init;
  this.msg = '';
  var self = this;
  this.stream.on('readable', function () {
    self.read();
  });
  this.variables = {};
  this.read();
  this.pending = null;
  this.stream.on('error', this.emit.bind(this, 'error'));
  this.stream.on('close', this.emit.bind(this, 'close'));
};

require('util').inherits(Context, EventEmitter);

/**
 * Write the next item in the queue.
 */
Context.prototype.next = function () {
  debug('calling next queued request');
  var nextQueuedItem = this.pendingResponses[0];
  if (nextQueuedItem) {
    if (nextQueuedItem.wasWritten) {
      debug('WARN: refusing to write queued request a second time', nextQueuedItem.message);
      return;
    }
    debug('writing to socket', nextQueuedItem.message);
    this.stream.write(nextQueuedItem.message, function () {
      debug('wrote to socket', nextQueuedItem.message);
    });
    nextQueuedItem.wasWritten = true;
  } else {
    debug('no more requests enqueued');
  }
};

Context.prototype.read = function () {
  var buffer = this.stream.read();
  if (!buffer) {
    this.next();
    return;
  }

  var utf8Message = buffer.toString('utf8');
  debug('read', utf8Message);
  this.msg += utf8Message;

  if (this.state === STATE.init) {
    if (this.msg.indexOf('\n\n') < 0) {
      return; // we don't have whole message
    }
    this.readVariables();
    return;
  }
  if (this.state === STATE.waiting) {
    if (this.msg.indexOf('\n') < 0) {
      return this.msg; // we don't have whole message
    }
    this.readResponse();
    return;
  }
  // this should not happen
  debug('invalid state during read()', this.state, utf8Message);
};

// internal
Context.prototype.readVariables = function () {
  debug('readVariables', this.msg);
  var a, b;
  while ((a = this.msg.match(/^(.*?)\n([^]*)/))) {
    b = a[1].match(/^(.*?):(.*)/);
    if (b && b[1]) {
      this.variables[b[1]] = (b[2] || '').trim();
    }
    this.msg = a[2];
  }
  debug('emitting variables', this.variables);
  this.emit('variables', this.variables);
  this.setState(STATE.waiting);
};

// internal
Context.prototype.readResponse = function () {
  debug('readResponse', this.msg);
  var a;
  while ((a = this.msg.match(/^(.*?)\n([^]*)/))) {
    this.readResponseLine(a[1]);
    this.msg = a[2];
  }
};

// internal
Context.prototype.readResponseLine = function (line) {
  debug('readResponseLine from asterisk', line);
  if (!line) {
    return;
  }

  if (line === 'HANGUP') {
    debug('hangup - received HANGUP from asterisk');
    this.emit('hangup');
    return;
  }

  // Getting a response which does not match this exact regex will
  // result in a hangup!
  var parsed = /^200(?: result=)(.*)/.exec(line);

  if (!parsed) {
    debug('hangup - response line is unexpected', line);
    this.emit('hangup');
    var responseRejecter = this.pendingResponses.shift();
    if (responseRejecter) {
      debug('rejecting pending response for line received from asterisk', line);
      responseRejecter.reject(new Error(JSON.stringify(line)));
    }

    debug('pendingResponses', this.pendingResponses.length);
    this.next();
    return;
  }

  var response = parsed[1];
  debug('parsed line result', response);
  // resolve the promise that we created when request() was called.
  // promises are resolved in order, so that we could pipeline a bunch
  // of setVariable (or whatever) without caring about the responses.

  var responseResolver = this.pendingResponses.shift();
  if (responseResolver) {
    debug('resolving pendingResponse', response);
    responseResolver.resolve(response);
  }
  debug('pendingResponses', this.pendingResponses.length);
  this.next();
};

// internal
Context.prototype.setState = function (state) {
  debug('setState', state);
  this.state = state;
};

// internal method to make a request.    Returns a Promise that
// is resolved to the response (stuff after the 200) to the command.
Context.prototype.request = function (msg) {
  let res;
  let rej;
  debug('queueing request', msg);

  const promise = new Promise(function (resolve, reject) {
    res = resolve;
    rej = reject;
  });

  this.pendingResponses.push({
    message: msg,
    resolve: res,
    reject: rej,
  });

  debug('pendingResponses', this.pendingResponses.length);
  this.next();

  return promise;
};

// agi EXEC
Context.prototype.exec = function () {
  debug('exec', arguments);
  return this.request('EXEC ' + Array.prototype.join.call(arguments, ' ') + '\n');
};

Context.prototype.dial = function (num, timeout, params) {
  debug('dial', { num: num, timeout: timeout, params: params });
  return this.exec('Dial', num + ',' + timeout + ',' + params);
};

// returns a Promise to the value of the channel variable.
Context.prototype.getVariable = function (name) {
  debug('getVariable', name);
  return this.request('GET VARIABLE ' + name + '\n').then(function (res) {
    var a = /^1\s+\((.*)\)/.exec(res);
    return a ? a[1] : undefined;
  });
};

// returns a Promise to the value of the channel variable expression.
// The channel parameter is optional.
Context.prototype.getFullVariable = function (variable, channel) {
  debug('getFullVariable', variable, channel);
  if (!channel) {
    channel = this.variables.agi_channel;
    debug('using agi_channel variable for getFullVariable', channel);
  }

  return this.request('GET FULL VARIABLE ' + variable + ' ' + channel + '\n').then(function (res) {
    var a = /^1\s+\((.*)\)/.exec(res);
    return a ? a[1] : undefined;
  });
};

Context.prototype.setVariable = function (name, value) {
  debug('setVariable', name, value);
  return this.request('SET VARIABLE ' + name + ' ' + value + '\n');
};

Context.prototype.verbose = function (message, level) {
  debug('verbose', message, level);
  return this.request('VERBOSE "' + message + '" ' + level + '\n');
};

// TODO: dynamically modifying the prototype is an anti-pattern.
// this is used below to generate methods for some simpler operations.
function createSimpleMethod(command) {
  // command is like GET FULL VARIABLE.  Create a string like getFullVariable.
  var camelCasedMethod = '';

  command
    .toLowerCase()
    .split(' ')
    .forEach(function (word, idx) {
      var add = word.toLowerCase();
      camelCasedMethod += idx === 0 ? add : add[0].toUpperCase() + add.slice(1);
    });

  Context.prototype[camelCasedMethod] = function () {
    var text = command + ' ' + Array.prototype.join.call(arguments, ' ') + '\n';
    debug(camelCasedMethod, text);
    return this.request(text);
  };

  debug('initialized method', command, camelCasedMethod);
}

// create prototype methods for trivial operations (which don't
// require any special quoting or anything).  These will automatically
// get turned into camelcased names like setCallerid.
['ANSWER', 'NOOP', 'SET CONTEXT', 'SET EXTENSION', 'SET PRIORITY', 'SET CALLERID'].forEach(
  createSimpleMethod
);

Context.prototype.recordFile = function (
  filename,
  format,
  escapeDigits,
  timeout,
  offset,
  beep,
  silence
) {
  var str = [
    '"' + filename + '"',
    format,
    escapeDigits,
    parseInt(timeout) * 1000,
    offset,
    beep,
    silence,
  ].join(' ');
  debug('recordFile', str);
  return this.request('RECORD FILE ' + str + '\n');
};

Context.prototype.sayNumber = function (number, escapeDigits) {
  debug('sayNumber', number, escapeDigits);
  return this.request('SAY NUMBER ' + number + ' "' + escapeDigits + '"' + '\n');
};

Context.prototype.sayAlpha = function (number, escapeDigits) {
  debug('sayAlpha', number, escapeDigits);
  return this.request('SAY ALPHA ' + number + ' "' + escapeDigits + '"' + '\n');
};

Context.prototype.sayDate = function (seconds, escapeDigits) {
  // seconds since 1.01.1970
  debug('sayDate', seconds, escapeDigits);
  return this.request('SAY DATE ' + seconds + ' "' + escapeDigits + '"' + '\n');
};

Context.prototype.sayTime = function (seconds, escapeDigits) {
  // seconds since 1.01.1970
  debug('sayTime', seconds, escapeDigits);
  return this.request('SAY TIME ' + seconds + ' "' + escapeDigits + '"' + '\n');
};

Context.prototype.sayDateTime = function (seconds, escapeDigits, format, timezone) {
  // seconds since 1.01.1970
  debug('sayDateTime', seconds, escapeDigits, format, timezone);
  return this.request(
    'SAY DATETIME ' + seconds + ' "' + escapeDigits + '" ' + format + ' ' + timezone + '\n'
  );
};

Context.prototype.sayDigits = function (digits, escapeDigits) {
  debug('sayDigits', digits, escapeDigits);
  return this.request('SAY DIGITS ' + digits + ' "' + escapeDigits + '"' + '\n');
};

Context.prototype.sayPhonetic = function (string, escapeDigits) {
  debug('sayPhonetic', string, escapeDigits);
  return this.request('SAY PHONETIC ' + string + ' "' + escapeDigits + '"' + '\n');
};

Context.prototype.streamFile = function (filename, acceptDigits) {
  if (undefined === acceptDigits) {
    acceptDigits = '1234567890#*';
  }
  debug('streamFile', filename, acceptDigits);
  return this.request('STREAM FILE "' + filename + '" "' + acceptDigits + '"\n').then(function (
    res
  ) {
    var ccode;
    var parsed = /^(\d+)\s+endpos=(\d+)/.exec(res);
    var streamFileSuccess;
    if (parsed) {
      ccode = parseInt(parsed[1]);
      streamFileSuccess = {
        key: ccode > 0 ? String.fromCharCode(ccode) : undefined,
        endpos: parseInt(parsed[2]),
      };
      debug('streamFile success', streamFileSuccess);
      return streamFileSuccess;
    } else {
      debug('streamFile parse response failed', res);
    }
  });
};

Context.prototype.waitForDigit = function (timeout) {
  if (undefined === timeout) {
    // default to 2 second timeout
    timeout = 5000;
  }
  debug('waitForDigit', timeout);
  return this.request('WAIT FOR DIGIT ' + timeout + '\n').then(function (res) {
    var ccode;
    var parsed = /^(\d+)/.exec(res);
    if (parsed) {
      ccode = parseInt(parsed[1]);
      return {
        key: ccode > 0 ? String.fromCharCode(ccode) : undefined,
      };
    } else {
    }
  });
};

Context.prototype.hangup = function () {
  return this.request('HANGUP\n');
};

Context.prototype.end = function () {
  debug('ending stream', this.variables);
  this.stream.end();
};

/**
 * Main entry point.  Create a server listening on the given port;
 * onconnect will be called with a Context object whenever a request
 * comes in.
 * @param  {number} port
 * @param  {function} onconnect - callback(context)
 * @return {net.Server}
 */
function createServer(port, onconnect) {
  debug('createServer', port);
  var server = require('net').createServer(function (stream) {
    debug('server created');
    var context = new Context(stream);

    context.on('variables', function (vars) {
      debug('got variables', vars);
      context.variables = vars;
      onconnect(context);
    });
  });
  server.listen(port);
  return server;
}

module.exports = {
  Context: Context,
  createServer: createServer,
  createSimpleMethod: createSimpleMethod,
};
