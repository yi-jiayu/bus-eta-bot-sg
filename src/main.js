"use strict";

require('dotenv').config();

const debug = require('debug')('bus-eta-bot-sg:main');
const Bot = require('./bot/bot').Bot;
const KeenAnalytics = require('./analytics/keen2').KeenAnalytics;
const DynamoDBDatastore = require('./datastore/dynamodb').DynamoDBDatastore;

const datastore = new DynamoDBDatastore('bus-eta-bot-sg-test', 'my_key');
const analytics = new KeenAnalytics();
const bot = new Bot(datastore, analytics);

exports.handler = function (event, context, callback) {
  console.log(event);

  bot.handle(event)
    .catch(err => debug(err))
    .then(() => callback(null));
};
