"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/command-handlers/default');
const telegram = require('../../telegram');
const eta_query_results_message = require('../eta-query-results-message');
const strings = require('../strings');

/**
 *
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} argstr
 * @returns {Promise}
 */
module.exports = function (bot, msg, argstr) {
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

          // reset user state
          .then(() => bot.datastore.setUserState(chat_id, 'none'))

          // unless there were no etas then we send an error message
          .catch(err => {
            if (err === 'no_etas') {
              return new telegram.OutgoingTextMessage(strings.no_etas_error_text).send(chat_id);
            } else {
              throw err;
            }
          })

          // analytics
          .then(() => Promise.all([bot.analytics.logAction(action_type, bus_stop, svc_nos), bot.analytics.logUser(action_type, msg)]))

          .catch(err => {
            debug(err);
            return bot.analytics.logError(action_type, err.message);
          });
      } else
      // fixme: should factor out all the seperate default handlers
      if (state === 'save_query') {
        // test if argstr is a valid eta query
        const args = argstr.split(' ');
        const bus_stop = args[0];
        const svc_nos = args.slice(1);

        const user_id = msg.user_id;

        return eta_query_results_message(bus_stop, svc_nos)
        // if it succeeds it means that it is a valid query string
        // and its time to ask the user to give a name to this query
          .then(() => {
            const request_label_msg = "Alright, now send me a short label to save this query as.";
            return new telegram.OutgoingTextMessage(request_label_msg)
              .send(chat_id);
          })

          // update user state
          .then(() => bot.datastore.setUserState(user_id, 'save_label', {query: argstr}))

          // analytics
          .then(() => Promise.all([bot.analytics.logAction('save_query_success'), bot.analytics.logUser(msg)]))

          // catch the err and check if it was a no_etas
          .catch(err => {
            if (err === 'no_etas') {
              // send the user an error message
              const invalid_query_message = "Oops, looks like that was an invalid query. Could you double check it " +
                "and tell me again?";
              return new telegram.OutgoingTextMessage(invalid_query_message)
                .send(chat_id)

                // analytics
                .then(() => Promise.all([bot.analytics.logAction('save_query_error'), bot.analytics.logUser(msg)]))
                .catch(err => {
                  debug(err);
                  return bot.analytics.logError('save_query_error', err.message);
                })
            } else {
              debug(err);
              return bot.analytics.logError('save_query_success', err.message);
            }
          });
      } else if (state === 'save_label') {
        const query = result.data.query;
        const user_id = msg.user_id;
        const favourite = {
          query,
          label: argstr
        };

        return bot.datastore.addUserFavourite(user_id, favourite)
          .then(() => {
            const favourite_saved_message = `Alright, saved the query \`${query}\` into your favourites with the label "${argstr}".`;
            return new telegram.OutgoingTextMessage(favourite_saved_message, {parse_mode: 'Markdown'})
              .send(chat_id);
          })

          // clear state
          .then(() => bot.datastore.setUserState(user_id, 'none'))

          // analytics
          .then(() => Promise.all([bot.analytics.logAction('save_complete'), bot.analytics.logUser('save_complete', msg)]))

          .catch(err => {
            debug(err);
            return bot.analytics.logError('save_complete', err.message);
          });
      }
    });
};
