"use strict";

const debug = require('debug')('bus-eta-bot-sg/command-handlers/default');
const telegram = require('../../telegram');
const eta_query_results_message = require('../eta-query-results-message');
const no_etas_error_text = 'Oops! Your query returned no etas. Are you sure you entered it correctly?';

/**
 *
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} argstr
 * @returns {Promise}
 */
module.exports = function(bot, msg, argstr) {
  // unless the user is responding to a eta_noargs_challenge, we ignore the message
  const chat_id = msg.chat_id;

  return bot.datastore.getUserState(chat_id)

    .then(result => {
      const {state} = result;

      if (state === 'eta') {
        const args = argstr.split(' ');
        const bus_stop = args[0];
        const svc_nos = args.slice(1);

        const action_type = 'eta_noargs_cont';
        const chat_id = msg.chat_id;

        // respond with eta
        return eta_query_results_message(bus_stop, svc_nos)

          // send response
          .then(msg => msg.send(chat_id))

          // and push it to history
          .then(() => bot.datastore.pushUserHistory(chat_id, argstr))

          // unless there were no etas then we send an error message
          .catch(err => {
            if (err === 'no_etas') {
              return new telegram.OutgoingTextMessage(no_etas_error_text).send(chat_id);
            } else {
              throw err;
            }
          })

          // reset user state
          .then(() => bot.datastore.setUserState(chat_id, 'none'))

          // analytics
          .then(() => Promise.all([bot.analytics.logAction(action_type, bus_stop, svc_nos), bot.analytics.logUser(action_type, msg)]))

          .catch(err => {
            debug(err);
            return bot.analytics.logError(action_type, err.message);
          });
      }
    });
};
