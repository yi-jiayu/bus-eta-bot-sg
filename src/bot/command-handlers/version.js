"use strict";

const telegram = require('../../telegram');

/**
 * /version command handler
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 */
module.exports = function (bot, msg) {
  const text = `Bus Eta Bot \`v${process.env.BOT_VERSION}\``;
  const config = {parse_mode: 'Markdown'};

  return new telegram.OutgoingTextMessage(text, config).send(msg.chat_id);
};
