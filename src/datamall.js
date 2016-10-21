"use strict";

const request = require('request');
const debug = require('debug')('bus-eta-bot:datamall');

const BUS_ETA_ENDPOINT = 'http://datamall2.mytransport.sg/ltaodataservice/BusArrival';
const MILLISECONDS_IN_A_MINUTE = 60 * 1000;

/**
 * A response from the LTA Bus Arrival API
 * @typedef {object} BusEtaResponse
 * @prop {string} Metadata
 * @prop {string} BusStopID
 * @prop {ServiceInfo[]} Services
 */

/**
 * Information about a particular bus service
 * @typedef {object} ServiceInfo
 * @prop {string} ServiceNo
 * @prop {string} Status
 * @prop {string} Operator
 * @prop {string} OriginatingID
 * @prop {string} TerminatingID
 * @prop {ArrivingBusInfo} NextBus
 * @prop {ArrivingBusInfo} SubsequentBus
 * @prop {ArrivingBusInfo} SubsequentBus3
 */

/**
 * Information about an incoming bus
 * @typedef {object} ArrivingBusInfo
 * @prop {string} EstimatedArrival
 * @prop {string} Latitude
 * @prop {string} Longitude
 * @prop {string} VisitNumber
 * @prop {string} Load
 * @prop {string} Feature
 */

/**
 * Queries the LTA bus arrival API
 * @private
 * @param busStop
 * @returns {Promise.<BusEtaResponse>}
 */
function fetchBusEtas(busStop) {
  var options = {
    url: BUS_ETA_ENDPOINT,
    headers: {
      AccountKey: process.env.LTA_DATAMALL_ACCOUNT_KEY,
      UniqueUserId: process.env.LTA_DATAMALL_USER_ID,
      accept: 'application/json'
    },
    qs: {
      BusStopID: busStop
    }
  };

  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        debug(err);
        reject(err);
      } else resolve(JSON.parse(body));
    });
  });
}

/**
 * Calculate the estimated time of arrival in minutes for each service in the provided BusEtaResponse
 * @param {BusEtaResponse} busEtaResponse
 */
function calculateEtaMinutes(busEtaResponse) {
  const bus_stop = busEtaResponse.BusStopID;
  const services = busEtaResponse.Services;
  const etas = [];
  const updated = new Date();

  for (const service of services) {
    const placeholder = service.Status === 'Not In Operation' ? '-' : '?';

    const svcNo = service.ServiceNo;
    const next = service.NextBus.EstimatedArrival !== ''
      ? Math.floor((new Date(service.NextBus.EstimatedArrival) - updated) / MILLISECONDS_IN_A_MINUTE)
      : placeholder;
    const subsequent = service.SubsequentBus.EstimatedArrival != ''
      ? Math.floor((new Date(service.SubsequentBus.EstimatedArrival) - updated) / MILLISECONDS_IN_A_MINUTE)
      : placeholder;
    const third = service.SubsequentBus3.EstimatedArrival != ''
      ? Math.floor((new Date(service.SubsequentBus3.EstimatedArrival) - updated) / MILLISECONDS_IN_A_MINUTE)
      : placeholder;
    etas.push({svcNo, next, subsequent, third});
  }
  return {etas, updated, bus_stop};
}

/**
 * Returns a promise which resolves to an array of objects, each representing a particular bus and
 * the getEtas of the next 3 buses.
 * @param {string} busStop
 * @returns {Promise}
 */
function getEtas(busStop) {
  return fetchBusEtas(busStop)
    .then(calculateEtaMinutes);
}

module.exports = {
  getEtas
};

function main() {
  getEtas('jiayu1')
    .then(console.log);
}

if (require.main === module) {
  main();
}
