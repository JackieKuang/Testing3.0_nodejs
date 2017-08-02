'use strict';

const _ = require('lodash');
const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');
const consul = require('consul')();

const ENVIRONMENT_KEY = 'platform/environment';

consul.kv.get(ENVIRONMENT_KEY, (err, result) => {
  if (err) {
    winston.error('=== Query environment failed:', err);
  }

  let env = result.Value;

  // client side
  if (!_.isEmpty(env)) {
    fs.copySync(path.resolve(__dirname, '../client/src/config/config.' + env + '.js'), path.resolve(__dirname, '../client/public/!js/config.js'));
    fs.copySync(path.resolve(__dirname, '../handlebars/partials/common/html-head.production.html'), path.resolve(__dirname, '../handlebars/partials/common/html-head.html'));
  }

  // server side
  if (_.isNil(env) || _.isEmpty(env) || 'production' === env) {
    winston.warn('=== Empty environment value or production ready, will use production first.');
  } else {
    fs.copySync(path.resolve(__dirname, '../server/config.' + env + '.json'), path.resolve(__dirname, '../server/config.production.json'));
    winston.info('=== Done with vanguard.');
  }
});
