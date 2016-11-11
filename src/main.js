"use strict";

require('dotenv').config();

const debug = require('debug')('bus-eta-bot-sg:main');
const Bot = require('./bot/bot').Bot;

let analytics;
if (process.env.ANALYTICS === 'Keen') {
  const KeenAnalytics = require('./analytics/keen2').KeenAnalytics;
  analytics = new KeenAnalytics();
}
analytics = analytics || null;

let datastore;
if (process.env.DATASTORE === 'DynamoDB') {
  const DynamoDBDatastore = require('./datastore/dynamodb').DynamoDBDatastore;
  datastore = new DynamoDBDatastore(process.env.DYNAMODB_TABLE, process.env.DYNAMODB_KEY);
}
datastore = datastore || null;

const bot = new Bot(datastore, analytics);

exports.handler = function (event, context, callback) {
  console.log(event);

  bot.handle(event)
    .catch(err => debug(err))
    .then(() => callback(null));
};
