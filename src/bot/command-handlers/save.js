"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/save');
const telegram = require('../../telegram');

/**
 * Command handler for /save
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} argstr
 */
module.exports = function (bot, msg, argstr) {
  const action_type = 'save_new';
  const user_id = msg.user_id;
  const chat_id = msg.chat_id;

  // send user a message asking them to give a query to save
  const query_request = "Send me the query you would like to save, eg. `96049 2 24` if you would like to save a " +
    "query for buses 2 and 24 at bus stop 96049.";
  return new telegram.OutgoingTextMessage(query_request, {parse_mode: 'Markdown'})
    .send(chat_id)

    // update user state
    .then(() => bot.datastore.setUserState(user_id, 'save_query'))

    // analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type), bot.analytics.logUser(action_type, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });
};
