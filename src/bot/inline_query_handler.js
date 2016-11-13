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
  // if the inline query string length is too short, don't do anything to save resources
  if (ilq.query.length < 5) {
    return Promise.resolve();
  }

  // if its at least of a certain length, check if it matches any of the following:
  // labels for the user's saved queries
  // bus stops for the user's saved queries
  // argstrs in the user's history

  // then generate InputTextMessageContent s for each of the matches and send it as an answer

  // first we need to fetch the users history and saved queries
  const user_id = ilq.user_id;

  return Promise.all([bot.datastore.getUserHistory(user_id), bot.datastore.getUserFavourites(user_id)])

    .then(data => {
      let [history, favourites] = data;

      debug('history and favourites before filtering');
      debug(history);
      debug(favourites);

      // filter out all the argstrs in the user's history which start with the inline query
      history = history.filter(argstr => argstr.startsWith(ilq.query));

      // filter out all the saved queries in the user's history with either
      // 1. have an argstr which starts with the inline query
      // 2. has a label which contains the inline query
      favourites = favourites.filter(({query, label}) => {
        return query.startsWith(ilq.query)
          // todo: maybe we should normalise the case for this
          || label.includes(ilq.query);
      });

      debug('history and favourites after filtering');
      debug(history);
      debug(favourites);

      // populate the inline query results
      // since this will require a datamall api call per result, it would be good to do it in parallel
      // each result will need an inputtextmessagecontent as well as reply_markup
      const results = [];

      // start with the matched saved queries
      for (const fav of favourites) {
        const id = `${user_id}_${fav.query}`;
        const title = fav.label;
        const options = {
          description: 'Saved query',
        };

        const result = eta_query_result(fav.query)
          .then(({text, parse_mode, reply_markup}) => {
            const input_txt_msg_content = new telegram.InputTextMessageContent(text, {parse_mode});

            options.reply_markup = reply_markup;
            return new telegram.InlineQueryResultArticle(id, title, input_txt_msg_content, options);
          });

        results.push(result);
      }

      // add in the matched history argstrs
      for (const argstr of history) {
        // fixme: actually, if the argstr is already one of the favourites, we should skip it

        const id = `${user_id}_${argstr}`;
        const title = argstr;
        const options = {
          description: 'History'
        };

        const result = eta_query_result(argstr)
          .then(({text, parse_mode, reply_markup}) => {
            const input_text_msg_content = new telegram.InputTextMessageContent(text, {parse_mode});

            options.reply_markup = reply_markup;
            return new telegram.InlineQueryResultArticle(id, title, input_text_msg_content, options);
          });

        results.push(result);
      }

      // resolve all the InlineQueryResults in the results
      return Promise.all(results)
        .then(results => {
          debug(results);
          return ilq.answerInlineQuery(results, {is_personal: true})
        })
        .then(aiq => {
          debug(aiq.params);
          debug(JSON.stringify(aiq.params));
          return aiq.do();
        })
        .then(body => debug(body));
    });
};
