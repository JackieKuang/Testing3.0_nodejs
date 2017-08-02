'use strict';

const EventEmitter = require('events');

class DatabaseEventEmitter extends EventEmitter {}

module.exports.dbEvent = new DatabaseEventEmitter();
