"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/help');
const telegram = require('../../telegram');

/**
 * Handler for /help command
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @returns {Promise}
 */
module.exports = function (bot, msg) {
  const action_type = 'help_display';

  const chat_id = msg.chat_id;

  const text = `*Bus Eta Bot Help*
Commands: 
\`/eta [bus stop code] [service numbers]\` - Get etas for a particular bus stop, optionally filtered by specific service numbers.
\`/history\` - List your most recent successful eta queries.
\`/version\` - Show the current Bus Eta Bot version.
\`/about\` - View more information about this bot.
\`/help\` - Display this message.`;

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
