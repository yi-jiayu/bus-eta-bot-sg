"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/eta');

const telegram = require('../../telegram');

const eta_query_results_message = require('../eta-query-results-message');
const strings = require('../strings');

/**
 * Handler function for eta command called without arguments
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 */
function eta_noargs(bot, msg) {
  const action_type = 'eta_noargs';
  const chat_id = msg.chat_id;

  const text = strings.eta_noargs_challenge_text;
  const config = {parse_mode: 'Markdown'};

  // send challenge message asking for bus stop and service numbers
  return new telegram.OutgoingTextMessage(text, config).send(chat_id)

  // update user state to reflect being in the midst of an eta request
    .then(() => bot.datastore.setUserState(chat_id, 'eta'))

    // analytics
    .then(() => Promise.all([bot.analytics.logAction(action_type), bot.analytics.logUser(action_type, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });
}

/**
 * Handler function for eta command called with arguments
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} bus_stop
 * @param {string[]} svc_nos
 */
function eta(bot, msg, bus_stop, svc_nos) {
  const action_type = 'eta_with_args';
  const chat_id = msg.chat_id;

  return eta_query_results_message(bus_stop, svc_nos)

  // respond with eta
    .then(msg => msg.send(chat_id))

    // save query to history
    .then(() => bot.datastore.pushUserHistory(chat_id, [bus_stop, ...svc_nos].join(' ')))

    // unless it returned no etas
    .catch(err => {
      if (err === 'no_etas') {
        return new telegram.OutgoingTextMessage(strings.no_etas_error_text).send(chat_id);
      } else {
        throw err;
      }
    })

    // analytics
    .then(() => Promise.all([bot.analytics.logAction('eta_with_args', bus_stop, svc_nos), bot.analytics.logUser(action_type, msg)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(action_type, err.message);
    });
}

module.exports = function (bot, msg, argstr) {
  const args = argstr.split(' ');

  if (args.length === 1 && args[0] === '') {
    return eta_noargs(bot, msg);
  } else {
    const busStop = args[0];
    const svcNos = args.slice(1);

    return eta(bot, msg, busStop, svcNos);
  }
};
