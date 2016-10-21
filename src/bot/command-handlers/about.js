"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/about');
const telegram = require('../../telegram');

/**
 * About message
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 */
module.exports = function (bot, msg) {
  const action_type = 'about_display';

  const chat_id = msg.chat_id;

  const text = `*About Bus Eta Bot*
A simple telegram bot to query bus etas in Singapore.

[GitHub](https://github.com/yi-jiayu/bus-eta-bot-sg)`;

  const config = {
    parse_mode: 'Markdown'
  };

  return new telegram.OutgoingTextMessage(text, config).send(chat_id)

  // analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type), bot.analytics.logUser(action_type, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });
};
