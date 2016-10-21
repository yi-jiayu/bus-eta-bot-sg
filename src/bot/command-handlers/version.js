"use strict";

const telegram = require('../../telegram');

/**
 * /version command handler
 * @param {Bot} bot
 * @param {IncomingTextMessage} msg
 * @param {string} argstr
 */
module.exports = function (bot, msg, argstr) {
  const text = `\`${process.env.BOT_VERSION}\``;
  const config = {parse_mode: 'Markdown'};

  return new telegram.OutgoingTextMessage(text, config).send(msg.chat_id);
};
