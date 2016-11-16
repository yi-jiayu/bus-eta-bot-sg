"use strict";

const debug = require('debug')('bus-eta-bot-sg:inline_query_handler');
const telegram = require('../telegram');

const argstr_regex = /^\d{5}(?: \S+)*/;

/**
 * Creates a new placeholder message for a eta query to argstr
 * @param {string} id
 * @param {string} title
 * @param {string} description
 * @param {string} argstr
 * @return {InlineQueryResultArticle}
 */
function placeholder_message(id, title, description, argstr) {
  const options = {description};
  const input_text_msg_content = new telegram.InputTextMessageContent('Looking up etas...');
  options.reply_markup = {
    inline_keyboard: [[
      {
        text: 'Refresh',
        callback_data: JSON.stringify({t: 'eta', a: argstr})
      },
      {
        text: 'Done',
        callback_data: JSON.stringify({t: 'eta', d: true})
      }
    ]]
  };

  return new telegram.InlineQueryResultArticle(id, title, input_text_msg_content, options);
}

/**
 * Handler for inline queries
 * @param {Bot} bot
 * @param {InlineQuery} ilq
 */
module.exports = function (bot, ilq) {
  // things to show:
  // user's saved queries
  // user's history

  // filter by inline query on
  // saved queries: argstr and label
  // history: argstr

  // then generate InputTextMessageContent s for each of the matches and send it as an answer

  // first we need to fetch the users history and saved queries
  const user_id = ilq.user_id;

  return Promise.all([bot.datastore.getUserHistory(user_id), bot.datastore.getUserFavourites(user_id)])
    .then(data => {
      let [history, favourites] = data;

      // debug('history and favourites before filtering');
      // debug(history);
      // debug(favourites);

      // filter out all the argstrs in the user's history which include the inline query
      history = history.filter(argstr => argstr.includes(ilq.query));

      // filter out all the saved queries in the user's history with either
      // 1. have an argstr which starts with the inline query
      // 2. has a label which contains the inline query
      favourites = favourites.filter(({query, label}) => {
        const argstr_match = query.includes(ilq.query);
        const label_match = label.toUpperCase().includes(ilq.query.toUpperCase());

        return argstr_match || label_match;
      });

      // limit the number of saved queries we return (naively for now)
      // 5 is arbitarily chosen
      // history length is already at most 5
      favourites = favourites.slice(0, 5);

      // debug('history and favourites after filtering');
      // debug(history);
      // debug(favourites);

      // populate the inline query results
      // since this will require a datamall api call per result, it would be good to do it in parallel
      // each result will need an inputtextmessagecontent as well as reply_markup
      const resultsMap = new Map();

      for (const fav of favourites) {
        // skip if this argstr has already been encountered
        if (resultsMap.has(fav.query.slice(0, 64))) {
          continue
        }

        // limit fav.query length just in case since the max id length is 64 bytes
        const id = fav.query.slice(0, 64);
        const title = fav.query;
        const description = fav.label;
        const result = placeholder_message(id, title, description, fav.query);

        resultsMap.set(fav.query.slice(0, 64), result);
      }

      // add in the matched history argstrs
      for (const argstr of history) {
        // skip if the argstr has already been added
        if (resultsMap.has(argstr.slice(0, 64))) {
          continue
        }

        const id = argstr.slice(0, 64);
        const title = argstr;
        const description = 'History';

        const result = placeholder_message(id, title, description, argstr);

        resultsMap.set(argstr.slice(0, 64), result);
      }

      // convert the results map to an array
      const results = Array.from(resultsMap.values());

      debug(results);

      // check if the query is a new argstr and it is not already in results
      // todo: this may not be a valid eta query. eta-query-result needs to be able to handle the case when it is not
      if (argstr_regex.exec(ilq.query) !== null && !resultsMap.has(ilq.query)) {
        const id = ilq.query.slice(0, 64);
        const title = ilq.query;
        const description = 'New query';
        const result = placeholder_message(id, title, description, title);

        results.unshift(result);
      }

      // answer the inline query
      // set cache_time to 10 seconds since bus etas are extremely time sensitive
      return ilq.answerInlineQuery(results).do();
    })

    .then(debug)

    // analytics
    .then(() => Promise.all([bot.analytics.logAction('inline_query'), bot.analytics.logUser('inline_query', ilq)]))

    .catch(err => {
      debug(err);
      return bot.analytics.logError(err, err.message);
    });
};
