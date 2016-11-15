"use strict";

const request = require('request');
const Analytics = require('./nop').Analytics;

class KeenAnalytics extends Analytics {
  constructor() {
    super();

    this.project_id = process.env.KEEN_PROJECT_ID;
    this.write_key = process.env.KEEN_WRITE_KEY;
  }

  _logEvent(collection, event) {
    return new Promise((resolve, reject) => request.post({
      uri: `https://api.keen.io/3.0/projects/${this.project_id}/events/${collection}`,
      headers: {
        'Authorization': this.write_key
      },
      body: event,
      json: true
    }, (err, res, body) => {
      if (err) reject(err);
      else resolve(body);
    }));
  }

  /**
   * Log a user interaction
   * @param {string} action
   * @param {IncomingTextMessage|CallbackQuery|InlineQuery} source
   * @returns {Promise}
   */
  logUser(action, source) {
    const event = {
      action,
      user_id: source.user_id,
      first_name: source.first_name
    };

    if (source.last_name) {
      event.last_name = source.last_name;
    }

    if (source.username) {
      event.username = source.username;
    }

    return this._logEvent('users', event);
  }

  /**
   * Log an action performed by a user
   * @param {string} action
   * @param busStop
   * @param {string[]} svcNos
   * @returns {Promise}
   */
  logAction(action, busStop, svcNos) {
    const event = {
      action
    };

    if (busStop) {
      event.bus_stop = busStop;
    }

    if (svcNos) {
      event.svc_nos = svcNos;
    }

    return this._logEvent('actions', event);
  }

  /**
   * Log an error
   * @param {string} action
   * @param error
   */
  logError(action, error) {
    const event = {
      action
    };

    if (error) {
      event.error = error;
    }

    return this._logEvent('errors', event);
  }
}

module.exports = {
  KeenAnalytics
};
