"use strict";

const telegram = require('../telegram');

const parse_text_msg = require('./parse-text-msg');
const eta_callback_handler = require('./callback-query-handlers/eta');
const history_callback_handler = require('./callback-query-handlers/history');
const eta_command_handler = require('./command-handlers/eta');
const history_command_handler = require('./command-handlers/history');
const version_command_handler = require('./command-handlers/version');
const default_command_handler = require('./command-handlers/default');
const help_command_handler = require('./command-handlers/help');
const about_command_handler = require('./command-handlers/about');
const start_command_handler = require('./command-handlers/start');
const save_command_handler = require('./command-handlers/save');
const inline_query_handler = require('./inline_query_handler');

const NOPDatastore = require('../datastore/nop').Datastore;
const NOPAnalytics = require('../analytics/nop').Analytics;

class Bot {
  /**
   * Create a new bot instance
   * @param {NOPDatastore} datastore
   * @param {NOPAnalytics} analytics
   */
  constructor(datastore, analytics) {
    this.datastore = datastore || new NOPDatastore();
    this.analytics = analytics || new NOPAnalytics();

    this.callback_query_handlers = {
      'eta': eta_callback_handler,
      'hist': history_callback_handler
    };
    this.command_handlers = {
      '/eta': eta_command_handler,
      '/version': version_command_handler,
      '/history': history_command_handler,
      '/help': help_command_handler,
      '/about': about_command_handler,
      '/start': start_command_handler,
      '/save': save_command_handler,
      'default': default_command_handler
    };
  }

  static _isCallbackQuery(update) {
    return update.hasOwnProperty('callback_query');
  }

  static _isTextMessage(update) {
    return update.hasOwnProperty('message') && update.message.hasOwnProperty('text');
  }

  static _isInlineQuery(update) {
    return update.hasOwnProperty('inline_query');
  }

  _dispatch_callback_query(cbq) {
    const cbq_data = JSON.parse(cbq.data);
    const cbq_type = cbq_data.t;

    if (this.callback_query_handlers.hasOwnProperty(cbq_type)) {
      const handler = this.callback_query_handlers[cbq_type];
      return handler(this, cbq, cbq_data);
    } else return Promise.reject();
  }

  /**
   * @param {IncomingTextMessage} msg
   * @returns {Promise}
   * @private
   */
  _dispatch_text_message(msg) {
    const {command, argstr} = parse_text_msg(msg);

    if (command === null) {
      const handler = this.command_handlers.default;
      return handler(this, msg, argstr);
    }

    if (this.command_handlers.hasOwnProperty(command)) {
      const handler = this.command_handlers[command];

      return this.datastore.setUserState(msg.chat_id, 'none')
        .then(() => handler(this, msg, argstr));
    }

    return Promise.reject('no handler registered for command ' + command);
  }

  _handle_inline_query(ilq) {
    return inline_query_handler(this, ilq);
  }

  handle(update) {
    return Promise.resolve()
      .then(() => {
        if (Bot._isCallbackQuery(update)) {
          const cbq = new telegram.CallbackQuery(update.callback_query);
          return this._dispatch_callback_query(cbq);
        } else if (Bot._isTextMessage(update)) {
          const msg = new telegram.IncomingTextMessage(update.message);
          return this._dispatch_text_message(msg);
        } else if (Bot._isInlineQuery(update)) {
          const ilq = new telegram.InlineQuery(update.inline_query);
          return this._handle_inline_query(ilq);
        }
      });
  }
}

module.exports = {
  Bot
};
