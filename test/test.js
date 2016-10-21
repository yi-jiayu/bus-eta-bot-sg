"use strict";

const debug = require('debug')('bus-eta-bot-sg:main');
const Bot = require('../src/bot/bot').Bot;

const bot = new Bot(null, null);

const handler = function (event, context, callback) {
  console.log(event);
  bot.handle(event)
    .catch(err => debug(err))
    .then(() => callback(null));
};


const update = {
  "update_id": 668444687, "message": {
    "message_id": 5,
    "from": {"id": 100710735, "first_name": "Jiayu", "username": "jiayu1"},
    "chat": {"id": 100710735, "first_name": "Jiayu", "username": "jiayu1", "type": "private"},
    "date": 1476436973,
    "text": "/version",
    "entities": [{"type": "bot_command", "offset": 0, "length": 8}]
  }
};

handler(update, null, function() {});
