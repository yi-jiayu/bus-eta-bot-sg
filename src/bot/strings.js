"use strict";

module.exports = {
  help_text: `*Bus Eta Bot Help*
Commands: 
/eta [bus stop code] [service numbers] - Get etas for a particular bus stop, optionally filtered by specific service numbers.
/history - List your most recent successful eta queries.
/version - Show the current Bus Eta Bot version.
/about - View more information about this bot.
/help - Display this message.`,
  history_list_text: 'Here are some of your recent queries:',
  no_etas_error_text: 'Oops! Your query returned no etas. Are you sure you entered it correctly?',
  no_history_error_text: 'Oops, it looks like there are no queries in your history. Your most recent queries which returned etas will be accessible here.',
  eta_noargs_challenge_text: 'What is the number of the bus stop you would like etas for? You may optionally also include the specific bus services you\'re interested in. (Eg. `96049 2 24`)',
  about_text: `*About Bus Eta Bot*
A simple telegram bot to query bus etas in Singapore.

[GitHub](https://github.com/yi-jiayu/bus-eta-bot-sg)`,
  history_cancel_text: 'Use /history to view your most recent successful eta queries.',
  eta_callback_too_old_error_text: "Oops! It seems like this message is too old and I have forgotten about it, so I can't refresh the etas for you, sorry about that 😔",
  history_callback_too_old_error_text: "Oops! It seems like this message is too old and I have forgotten about it, so I can't refresh the etas for you, sorry about that 😔"
};
