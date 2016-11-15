# bus-eta-bot-sg

## Changelog

- 1.0.0 - Initial release
- 1.0.3 - Added /history command
- 1.0.4 - Added /help command
- 1.0.5 - Added /about command
- **1.0.9** 
  - Implemented saving a query and a label with /save
- **1.0.10**
  - Implemented inline mode
    - Search your saved queries and query history with an inline query to the bot
  - Implemented support for callback buttons in messages sent via inline mode
    - Previously the bot expected callback queries to include a 'message' field, but callback buttons from inline mode
      messages only contain an 'inline_query_id' field.
  - Changed 'Done' callback button implementation to use Telegram Bot API method 'updateMessageReplyMarkup' instead of
    'updateMessageText'

## TODO

1. Implement management of saved queries (currently you can only add new saved queries and search them, but not view,
  edit or delete them)
2. Refactor handlers to return the action and result back to the Bot class to handle analytics centrally
3. Add a switch_inline_query button to messages sent by the bot
4. Besides searching the user's saved queries and history in inline mode, also allow users to query directly from there
  - Probably have some kind of heuristic to determine if an inline query is a proper argstr, then test it against
    datamall and see if we get any results
5. Implement unit tests for individual methods and integration tests for bot handlers
6. Refactor out command-handlers/default into separate continuation-handlers for each state
7. Change versioning scheme to follow semantic versioning (semver)
  - Increment MINOR version instead of PATCH on feature updates

## Roadmap

- **1.1**
  - TODO #1, #4, #7
