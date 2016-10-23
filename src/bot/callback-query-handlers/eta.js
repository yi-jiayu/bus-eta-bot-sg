"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/callback-query-handlers/eta');
const telegram = require('../../telegram');

const eta_query_results_message = require('../eta-query-results-message');
const strings = require('../strings');

/**
 * Converts an IncomingTextMessage representing a previous eta query results message into a OutgoingTextMessage
 * to update the previous message with.
 * @param {IncomingTextMessage} msg
 * @returns {OutgoingTextMessage}
 */
function reconstruct_eta_message(msg) {
  const pre_block = msg.entities.find(entity => entity.type === 'pre') || null;

  if (pre_block === null) {
    throw new Error();
  }

  const offset = pre_block.offset;
  const length = pre_block.length;

  const header = msg.text.substring(0, offset - 1);
  const etas = msg.text.substring(offset, offset + length - 1);
  const last_updated = msg.text.substring(offset + length);

  const text = `*${header}*\n\`\`\`${etas}\`\`\`_${last_updated}_`;
  const config = {
    parse_mode: 'Markdown'
  };

  return new telegram.OutgoingTextMessage(text, config);
}

/**
 * Handler for the Done button in eta results
 * @param {Bot} bot
 * @param {CallbackQuery} cbq
 */
function eta_done(bot, cbq) {
  const action_type = 'eta_done';

  const original_message = cbq.message;
  const msg_without_buttons = reconstruct_eta_message(original_message);

  const chat_id = original_message.chat_id;
  const message_id = original_message.message_id;

  // remove done button and answer callback query
  return Promise.all([msg_without_buttons.update(chat_id, message_id), cbq.answer()])

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

  const chat_id = cbq.message.chat_id;
  const message_id = cbq.message.message_id;


  return eta_query_results_message(bus_stop, svc_nos)

    // update etas and answer callback query
    .then(msg => Promise.all([msg.update(chat_id, message_id), cbq.answer('Etas updated!')]))

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
  // if the message is too old and the callback query no longer includes the original message,
  // say that we can't respond to it
  if (cbq.message === null) {
    const text = strings.eta_callback_too_old_error_text;

    return cbq.answer(text);
  }

  const done = data.d;

  if (done) {
    return eta_done(bot, cbq);
  } else {
    const argstr = data.a;
    return eta_refresh(bot, cbq, argstr);
  }
};
