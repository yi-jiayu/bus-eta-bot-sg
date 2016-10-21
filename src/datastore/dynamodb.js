"use strict";

const debug = require('debug')('bus-eta-bot-sg:datastore/dynamodb');
const AWS = require('aws-sdk');

const Datastore = require('./interface').Datastore;

/**
 * DynamoDBDatastore implements a datastore based on AWS DynamoDB.
 */
class DynamoDBDatastore extends Datastore {
  /**
   * Creates a new datastore based on AWS DynamoDB
   * @param {string} tableName - Name of the DynamoDB table to be used to store data
   * @param {string} key - Name of they key column used by tableName
   * @param {object} [config] - Config options which will be passed to docClient
   */
  constructor(tableName, key, config) {
    super();

    this.tableName = tableName;
    this.key = key;

    config = config || {};
    this.docClient = new AWS.DynamoDB.DocumentClient(config);
  }

  /**
   * Set user state
   * @param chat_id
   * @param {string} state
   * @param [data]
   * @returns {Promise}
   */
  setUserState(chat_id, state, data) {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.key]: `${chat_id}_state`,
        user_state: state
      }
    };

    if (data) {
      params.Item.state_data = data;
    }

    return this.docClient.put(params).promise();
  }

  /**
   * Get user state
   * @param chat_id
   * @returns {Promise<UserState>}
   */
  getUserState(chat_id) {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.key]: `${chat_id}_state`
      }
    };

    return this.docClient.get(params).promise()
      .then(result => {
        const item = result.Item || {};
        const state = item.user_state || null;
        const data = item.state_data || null;

        return {state, data};
      });
  }

  /**
   * Pushes an eta argstr into the user's history
   * @param chat_id
   * @param {string} argstr
   * @returns {Promise}
   */
  pushUserHistory(chat_id, argstr) {
    // get user history first
    return this.getUserHistory(chat_id)
      .then(history => {
        if (history.indexOf(argstr) === -1) {
          history = [argstr, ...history];

          if (history.length > 5) {
            history = history.slice(0, this.HISTORY_SIZE);
          }

          const params = {
            TableName: this.tableName,
            Item: {
              [this.key]: `${chat_id}_history`,
              history
            }
          };

          return this.docClient.put(params).promise();
        }
      });
  }

  /**
   * Get the user's most recent eta queries which returned results
   * @param chat_id
   * @returns {Promise.<string[]>}
   */
  getUserHistory(chat_id) {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.key]: `${chat_id}_history`
      }
    };

    return this.docClient.get(params).promise()
      .then(result => {
        const item = result.Item || {};
        return item.history || [];
      });
  }
}

module.exports = {
  DynamoDBDatastore
};
