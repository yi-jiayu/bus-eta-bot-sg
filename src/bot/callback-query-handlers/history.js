"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/callback-query-handlers/history');
const telegram = require('../../telegram');
const eta_query_results_message = require('../eta-query-results-message');

/**
 *
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 * @param {string} argstr
 * @returns {Promise}
 */
function history_query(bot, cbq, argstr) {
  const action_type = 'history_query';

  const args = argstr.split(' ');
  const bus_stop = args[0];
  const svc_nos = args.slice(1);

  const chat_id = cbq.message.chat_id;
  const message_id = cbq.message.message_id;

  return eta_query_results_message(bus_stop, svc_nos)

  // send etas
    .then(msg => msg.update(chat_id, message_id))

    // analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type, bus_stop, svc_nos), bot.analytics.logUser(action_type, cbq)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });}

/**
 * Removes the inline keyboard when a user cancels a history query
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 */
function history_cancel(bot, cbq) {
  const action_type = 'history_cancel';

  const chat_id = cbq.message.chat_id;
  const message_id = cbq.message.message_id;

  const text = 'Use /history to view your most recent successful eta queries.';

  // remove callback buttons
  return new telegram.OutgoingTextMessage(text).update(chat_id, message_id)

    // analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type), bot.analytics.logUser(action_type, cbq)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });
}

/**
 * Handler for history callback queries
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 * @param data
 * @returns {Promise}
 */
module.exports = function (bot, cbq, data) {
  // if the message is too old and the callback query no longer includes the original message,
  // say that we can't respond to it
  if (cbq.message === null) {
    const text = "Oops! It seems like this message is too old and I have forgotten about it, so I can't refresh the " +
      "etas for you, sorry about that 😔";

    return cbq.answer(text);
  }

  const done = data.d;

  if (done) {
    // remove inline keyboard from message
    return history_cancel(bot, cbq);
  } else {
    const argstr = data.a;
    return history_query(bot, cbq, argstr);
  }
};
