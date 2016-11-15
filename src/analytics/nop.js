"use strict";

class Analytics {
  /**
   * Log a user interaction
   * @param {string} action
   * @param {IncomingTextMessage|CallbackQuery|InlineQuery} source
   * @returns {Promise}
   */
  logUser(action, source) {
  };

  /**
   * Log an action performed by a user
   * @param {string} action
   * @param busStop
   * @param {string[]} svcNos
   * @returns {Promise}
   */
  logAction(action, busStop, svcNos) {
  };

  /**
   * Log an error
   * @param {string} action
   * @param error
   * @returns {Promise}
   */
  logError(action, error) {
  };
}

module.exports = {
  Analytics
};
