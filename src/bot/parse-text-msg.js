"use strict";

function parse(msg) {
  const {text, entities} = msg;

  const cmdEntity = entities.find(entity => entity.type === 'bot_command') || null;
  let command, argstr;

  // extract command and args
  if (cmdEntity !== null) {
    command = text.substr(cmdEntity.offset, cmdEntity.length);
    argstr = text.substring(cmdEntity.offset + cmdEntity.length);
  } else {
    command = null;
    argstr = text;
  }

  // strip out extra whitespace and tags
  if (command !== null) {
    command = command
      .replace(/@\w+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  argstr = argstr
    .replace(/@\w+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {command, argstr};
}


module.exports = parse;
