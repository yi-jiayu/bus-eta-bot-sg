"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/callback-query-handlers/eta');
const telegram = require('../../telegram');

const eta_query_results_message = require('../eta-query-results-message');
const strings = require('../strings');

/**
 * Handler for the Done button in eta results
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 */
function eta_done(bot, cbq) {
  const action_type = 'eta_done';

  const answer_cbq_promise = cbq.answer();
  let edit_reply_markup_promise;

  if (cbq.inline_message_id === null) {
    const original_message = cbq.message;
    const chat_id = original_message.chat_id;
    const message_id = original_message.message_id;

    edit_reply_markup_promise = new telegram.editMessageReplyMarkup(chat_id, message_id, null).do();
  } else {
    const inline_message_id = cbq.inline_message_id;

    edit_reply_markup_promise = new telegram.editMessageReplyMarkup(null, null, inline_message_id, null).do();
  }

  // remove done button and answer callback query
  return Promise.all([answer_cbq_promise, edit_reply_markup_promise])

  // record analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type), bot.analytics.logUser(action_type, cbq)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    })

    .catch(err => debug(err));
}

/**
 * Handler for the Refresh button in eta results
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 * @param {string} argstr
 */
function eta_refresh(bot, cbq, argstr) {
  const action_type = 'eta_refresh';

  const args = argstr.split(' ');
  const bus_stop = args[0];
  const svc_nos = args.slice(1);

  let chat_id, msg_id, callback_query_id;

  if (cbq.inline_message_id === null) {
    chat_id = cbq.message.chat_id;
    msg_id = cbq.message.message_id;
    callback_query_id = null;
  } else {
    chat_id = null;
    msg_id = null;
    callback_query_id = cbq.callback_query_id;
  }

  return eta_query_results_message(bus_stop, svc_nos)

  // update etas and answer callback query
    .then(msg => Promise.all([msg.update(chat_id, msg_id, callback_query_id), cbq.answer('Etas updated!')]))

    // analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type, bus_stop, svc_nos), bot.analytics.logUser(action_type, cbq)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });
}

/**
 * Handler for eta callback queries
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 * @param data
 * @returns {Promise}
 */
module.exports = function (bot, cbq, data) {
  // determine if the callback query originated from a normal message or an inline mode message

  // if inline_message_id is null, it was a normal message
  if (cbq.inline_message_id === null) {
    // if the message is too old and the callback query no longer includes the original message,
    // say that we can't respond to it
    if (cbq.message === null) {
      const text = strings.eta_callback_too_old_error_text;

      return cbq.answer(text);
    }
  }

  const done = data.d;

  if (done) {
    return eta_done(bot, cbq);
  } else {
    const argstr = data.a;
    return eta_refresh(bot, cbq, argstr);
  }
};
