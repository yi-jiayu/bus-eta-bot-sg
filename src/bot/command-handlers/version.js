"use strict";
const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/about');
const telegram = require('../../telegram');

/**
 * /version command handler
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 */
module.exports = function (bot, msg) {
  const action = 'version';

  // todo: find way to include date with version information
  const text = `Bus Eta Bot \`v${process.env.BOT_VERSION}\``;
  const config = {parse_mode: 'Markdown'};

  return new telegram.OutgoingTextMessage(text, config).send(msg.chat_id)

  // analytics
    .then(() => Promise.all([bot.analytics.logAction(action), bot.analytics.logUser(action, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action, err.message);
    });
};
