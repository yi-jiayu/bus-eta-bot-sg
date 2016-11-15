"use strict";
const fs = require('fs');
const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/about');
const telegram = require('../../telegram');

let version;
if (fs.existsSync('../../package.json')) {
  // production (since package.json will be copied into same folder level as main)
  version = require('../../package.json').version;
} else {
  // development
  version = require('../../../package.json').version;
}

/**
 * /version command handler
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 */
module.exports = function (bot, msg) {
  const action = 'version';

  // todo: find way to include date with version information
  const text = `Bus Eta Bot \`v${version}\``;
  const config = {parse_mode: 'Markdown'};

  return new telegram.OutgoingTextMessage(text, config).send(msg.chat_id)

  // analytics
    .then(() => Promise.all([bot.analytics.logAction(action), bot.analytics.logUser(action, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action, err.message);
    });
};
