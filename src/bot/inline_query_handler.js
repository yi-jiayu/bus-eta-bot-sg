"use strict";

const debug = require('debug')('bus-eta-bot-sg:inline_query_handler');
const telegram = require('../telegram');
const eta_query_result = require('./eta-query-result');

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
      const results = [];

      // cache the results from the favourites in case one of the favourites argtrs is also in history
      const favourites_argstr_cache = {};

      // start with the matched saved queries
      for (const fav of favourites) {
        // the id is just the argstr we are querying for
        const id = fav.query;
        const title = fav.label;
        const options = {
          description: 'Saved query',
        };

        // check the favourites_argstr_cache if this argstr has already been looked up
        if (favourites_argstr_cache[fav.query]) {
          const {text, parse_mode, reply_markup} = favourites_argstr_cache[fav.query];
          const input_txt_msg_content = new telegram.InputTextMessageContent(text, {parse_mode});
          options.reply_markup = reply_markup;
          const result = Promise.resolve(new telegram.InlineQueryResultArticle(id, title, input_txt_msg_content, options));

          results.push(result);
        } else {
          const result = eta_query_result(fav.query)
            .then(({text, parse_mode, reply_markup}) => {
              // cache this result with the argstr as the key
              favourites_argstr_cache[fav.query] = {text, parse_mode, reply_markup};

              const input_txt_msg_content = new telegram.InputTextMessageContent(text, {parse_mode});
              options.reply_markup = reply_markup;
              return new telegram.InlineQueryResultArticle(id, title, input_txt_msg_content, options);
            });

          results.push(result);
        }
      }

      // add in the matched history argstrs
      for (const argstr of history) {
        // the id is just the argstr we are querying for
        const id = argstr;
        const title = argstr;
        const options = {
          description: 'History'
        };

        // check the favourites_argstr_cache if this argstr has already been looked up
        if (favourites_argstr_cache[argstr]) {
          const {text, parse_mode, reply_markup} = favourites_argstr_cache[argstr];
          const input_text_msg_content = new telegram.InputTextMessageContent(text, {parse_mode});
          options.reply_markup = reply_markup;
          const result = Promise.resolve(new telegram.InlineQueryResultArticle(id, title, input_text_msg_content, options));

          results.push(result);
        } else {
          const result = eta_query_result(argstr)
            .then(({text, parse_mode, reply_markup}) => {
              const input_text_msg_content = new telegram.InputTextMessageContent(text, {parse_mode});
              options.reply_markup = reply_markup;
              return new telegram.InlineQueryResultArticle(id, title, input_text_msg_content, options);
            });

          results.push(result);
        }
      }

      // resolve all the InlineQueryResults in the results
      return Promise.all(results)
        .then(results => {
          // set cache_time to 10 seconds since bus etas are extremely time sensitive
          return ilq.answerInlineQuery(results, {cache_time: 10, is_personal: true}).do();
        });
    });
};
