"use strict";

/**
 * @typedef {object} UserState
 * @property {string} state
 * @property {object} data
 */

class Datastore {
  constructor() {
    this.HISTORY_SIZE = 5;
  }

  /**
   * Set user state
   * @param chat_id
   * @param {string} state
   * @param [data]
   * @returns {Promise}
   */
  setUserState(chat_id, state, data) {
    return Promise.resolve();
  }

  /**
   * Get user state
   * @param chat_id
   * @returns {Promise<UserState>}
   */
  getUserState(chat_id) {
    return Promise.resolve();
  }

  /**
   * Pushes an eta argstr into the user's history
   * @param chat_id
   * @param {string} argstr
   * @returns {Promise}
   */
  pushUserHistory(chat_id, argstr) {
    return Promise.resolve();
  }

  /**
   * Get the user's most recent eta queries which returned results
   * @param chat_id
   * @returns {Promise.<string[]>}
   */
  getUserHistory(chat_id) {
    return Promise.resolve();
  }

  // todo: implement api for saving favourites
  // setUserFavourites(userId, favourites) {
  //   return Promise.resolve();
  // }
  //
  // getUserFavourites(userId) {
  //   return Promise.resolve();
  // }
}

module.exports = {
  Datastore
};
