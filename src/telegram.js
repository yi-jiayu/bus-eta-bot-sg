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
    return new editMessageText(chatId, msgId, null, this.text, this.config);
  }

  /**
   * Sends the message to chatId
   * @param chatId
   */
  send(chatId) {
    return new sendMessage(chatId, this.text, this.config).do();
  }

  update(chatId, msgId) {
    return new editMessageText(chatId, msgId, null, this.text, this.config);
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
    return new answerCallbackQuery(this.callback_query_id, text, show_alert, url);
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

const methods = {
  sendMessage,
  editMessageText,
  answerCallbackQuery
};

module.exports = {
  methods,
  IncomingTextMessage,
  CallbackQuery,
  OutgoingTextMessage
};
