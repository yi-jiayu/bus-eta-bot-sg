"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/history');
const telegram = require('../../telegram');
const strings = require('../strings');

/**
 * Command handler for /history
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} argstr
 */
module.exports = function(bot, msg, argstr) {
  const chat_id = msg.chat_id;
  const history_message = strings.history_list_text;
  const no_history_message = strings.no_history_error_text;

  return bot.datastore.getUserHistory(chat_id)
    .then(history => {
      if (history.length > 0) {
        const inline_keyboard = [];

        for (const argstr of history) {
          inline_keyboard.push([{
            text: argstr,
            callback_data: JSON.stringify({t: 'hist', a: argstr})
          }]);
        }

        inline_keyboard.push([{
          text: 'Cancel',
          callback_data: JSON.stringify({t: 'hist', d: true})
        }]);

        const text = history_message;
        const config = {
          reply_markup: JSON.stringify({
            inline_keyboard
          })
        };

        return new telegram.OutgoingTextMessage(text, config);
      } else {
        return new telegram.OutgoingTextMessage(no_history_message);
      }
    })

    .then(msg => msg.send(chat_id))

    // analytics
    .then(() => Promise.all([bot.analytics.logAction('list_history'), bot.analytics.logUser('list_history', msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError('list_history', err.message);
    });
};
