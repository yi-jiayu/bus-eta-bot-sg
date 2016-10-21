"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/start');
const telegram = require('../../telegram');

/**
 * /start command handler to display welcome message
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} argstr
 * @returns {Promise}
 */
module.exports = function (bot, msg, argstr) {
  const action = 'start';

  const chat_id = msg.chat_id;
  const first_name = msg.first_name;

  const text = `*Hello ${first_name}*,
  
Bus Eta Bot is a simple bot which can tell you the estimated time you have to wait for buses in Singapore. Its information comes from the same source as the official LTA MyTransport app and many other bus arrival time apps through the LTA Datamall API.

To get started, try sending /help to view available commands. I hope you will find Bus Eta Bot useful!`;

  const config = {
    parse_mode: 'Markdown'
  };

  return new telegram.OutgoingTextMessage(text, config).send(chat_id)

  // analytics
    .then(() => Promise.all([bot.analytics.logAction(action), bot.analytics.logUser(action, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(err, err.message);
    });
};
