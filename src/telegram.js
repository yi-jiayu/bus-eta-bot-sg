"use strict";

const request = require('request');

const endpoint = 'https://api.telegram.org/bot';
const token = process.env.TELEGRAM_BOT_TOKEN;

class OutgoingTextMessage {
  /**
   * Creates a new outgoing text message
   * @param {string} text
   * @param {object} [config]
   */
  constructor(text, config) {
    this.text = text;
    this.config = config || {};
  }

  sendMessage(chatId) {
    return new sendMessage(chatId, this.text, this.config);
  }

  editMessageText(chatId, msgId) {
    if (arguments.length === 2 || msgId === null) {
      return new editMessageText(chatId, msgId, null, this.text, this.config);
    } else if (arguments.length === 1) {
      return new editMessageText(null, null, chatId, this.text, this.config);
    } else {
      throw new TypeError();
    }
  }

  /**
   * Sends the message to chatId
   * @param chatId
   */
  send(chatId) {
    return this.sendMessage(chatId).do();
  }

  /**
   * Updates a message sent by the bot normally or via inline mode depending on the number of parameters
   * @param chatId
   * @param msgId
   * @return {*}
   */
  update(chatId, msgId) {
    if (msgId === null || arguments.length === 1) {
      return this.editMessageText(chatId).do();
    } else {
      return this.editMessageText(chatId, msgId).do();
    }
  }
}

class IncomingTextMessage {
  constructor(msg) {
    this.message = msg;
    this.message_id = msg.message_id;
    this.chat_id = msg.chat.id;
    this.chat_type = msg.chat.type;
    this.user_id = msg.from.id;
    this.first_name = msg.from.first_name;
    this.last_name = msg.from.last_name || null;
    this.username = msg.from.username || null;
    this.text = msg.text || '';
    this.entities = msg.entities || [];
  }
}

class CallbackQuery {
  constructor(cbq) {
    this.callback_query = cbq;
    this.callback_query_id = cbq.id;

    if (cbq.hasOwnProperty('message')) {
      this.message = new IncomingTextMessage(cbq.message);
    } else {
      this.message = null;
    }

    this.inline_message_id = cbq.inline_message_id || null;

    this.user_id = cbq.from.id;
    this.first_name = cbq.from.first_name;
    this.last_name = cbq.from.last_name || null;
    this.username = cbq.from.username || null;
    this.data = cbq.data || '';
  }

  /**
   * Answer a callback query and causes clients to stop showing a progress bar
   * @param {string} [text]
   * @param {boolean} [show_alert]
   * @param {string} [url]
   */
  answer(text, show_alert, url) {
    return new answerCallbackQuery(this.callback_query_id, text, show_alert, url).do();
  }
}

class InlineQuery {
  constructor(ilq) {
    this.inline_query = ilq;
    this.inline_query_id = ilq.id;
    this.user_id = ilq.from.id;
    this.first_name = ilq.from.first_name;
    this.last_name = ilq.from.last_name;
    this.username = ilq.from.username;

    this.query = ilq.query;
  }

  /**
   * Answer an inline query
   * @param {InlineQueryResult[]} results
   * @param {object} [options]
   * @param {number} [options.cache_time]
   * @param {boolean} [options.is_personal]
   * @param {string} [options.switch_pm_text]
   * @param {string} [options.switch_pm_parameter]
   */
  answerInlineQuery(results, options) {
    return new answerInlineQuery(this.inline_query_id, results, options);
  }

  /**
   * Answer an inline query
   * @param {InlineQueryResult[]} results
   * @param {object} [options]
   * @param {boolean} [options.is_personal]
   * @param {string} [options.switch_pm_text]
   * @param {string} [options.switch_pm_parameter]
   */
  answer(results, options) {
    return new answerInlineQuery(this.inline_query_id, results, options).do();
  }
}

class InlineQueryResult {
  /**
   * Superclass for all types of InlineQueryResults
   * @param {string} type
   */
  constructor(type) {
    this.type = type;
  }
}

class InlineQueryResultArticle extends InlineQueryResult {
  /**
   * Create a new InlineQueryResultArticle
   * @param {string} id - Unique identifier for this result, 1-64 Bytes
   * @param {string} title - Title of the result
   * @param {InputMessageContent} input_message_content - Content of the message to be sent
   * @param {object} [options]
   * @param {object} [options.reply_markup]
   * @param {string} [options.url]
   * @param {boolean} [options.hide_url]
   * @param {string} [options.description]
   */
  constructor(id, title, input_message_content, options) {
    super('article');

    this.id = id;
    this.title = title;
    this.input_message_content = input_message_content;

    // optional attributes
    const optional_attributes = ['reply_markup', 'url', 'hide_url', 'description'];
    for (const attr of optional_attributes) {
      if (options[attr]) {
        this[attr] = options[attr];
      }
    }
  }
}

class InputMessageContent {
}

class InputTextMessageContent extends InputMessageContent {
  /**
   * Create a new InputTextMessageContent
   * @param {string} text
   * @param {object} [options]
   * @param {string} [options.parse_mode]
   * @param {boolean} [options.disable_web_page_preview]
   */
  constructor(text, options) {
    super();

    this.message_text = text;

    if (options.parse_mode) {
      this.parse_mode = options.parse_mode;
    }

    if (options.disable_web_page_preview) {
      this.disable_web_page_preview = options.disable_web_page_preview;
    }
  }
}

class TelegramMethod {
  constructor(method) {
    this.method = method;
    this.params = {};
  }

  serialise() {
    const body = this.params;
    body.method = this.method;
    return body;
  }

  do() {
    return new Promise((resolve, reject) => {
      request.post({
          uri: endpoint + token + '/' + this.method,
          body: this.params,
          json: true
        },
        (err, res, body) => {
          if (err) reject(err);
          else resolve(body);
        })
    });
  }
}

class sendMessage extends TelegramMethod {
  constructor(chatId, text, config) {
    super('sendMessage');

    const params = {
      chat_id: chatId,
      text
    };

    const optional = ['parse_mode', 'disable_web_page_preview', 'disable_notification', 'reply_to_message_id', 'reply_markup'];
    for (const param of optional) {
      if (config[param]) {
        params[param] = config[param];
      }
    }

    this.params = params;
  }
}

class editMessageText extends TelegramMethod {
  constructor(chatId, msgId, inlineMsgId, text, config) {
    super('editMessageText');

    const params = {
      text
    };

    if (inlineMsgId === null) {
      params.chat_id = chatId;
      params.message_id = msgId;
    } else {
      params.inline_message_id = inlineMsgId;
    }

    const optional = ['parse_mode', 'disable_web_page_preview', 'reply_markup'];
    for (const param of optional) {
      if (config[param]) {
        params[param] = config[param];
      }
    }

    this.params = params;
  }
}

class answerCallbackQuery extends TelegramMethod {
  constructor(callback_query_id, text, show_alert, url) {
    super('answerCallbackQuery');

    if (!callback_query_id) {
      throw new TypeError();
    }

    const params = {
      callback_query_id
    };

    if (text) {
      params.text = text;
    }

    if (show_alert) {
      params.show_alert = show_alert;
    }

    if (url) {
      params.url = url;
    }

    this.params = params;
  }
}

class answerInlineQuery extends TelegramMethod {
  /**
   * Answer an inline query
   * @param {string} inline_query_id
   * @param {InlineQueryResult[]} results
   * @param {object} [options]
   * @param {boolean} [options.is_personal]
   * @param {string} [options.switch_pm_text]
   * @param {string} [options.switch_pm_parameter]
   */
  constructor(inline_query_id, results, options) {
    super('answerInlineQuery');

    this.params = {
      inline_query_id,
      results: JSON.stringify(results)
    };

    const optional_attributes = ['cache_time', 'is_personal', 'next_offset', 'switch_pm_text', 'switch_pm_parameter'];
    for (const attr of optional_attributes) {
      if (options[attr]) {
        this.params[attr] = options[attr];
      }
    }
  }
}

const methods = {
  sendMessage,
  editMessageText,
  answerCallbackQuery
};

module.exports = {
  methods,
  IncomingTextMessage,
  CallbackQuery,
  OutgoingTextMessage,
  InlineQuery,
  InlineQueryResultArticle,
  InputTextMessageContent
};
