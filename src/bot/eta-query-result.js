"use strict";

const debug = require('debug')('bus-eta-bot-sg:bot/eta-query-result');
const table = require('text-table');
const moment = require('moment-timezone');

const datamall = require('../datamall');
const telegram = require('../telegram');

/**
 * @param {string} argstr
 * @returns {Promise<object>}
 */
function eta_query_results(argstr) {
  const args = argstr.split(' ');
  const bus_stop = args[0];
  const svc_nos = args.slice(1);

  // get eta information
  return datamall.getEtas(bus_stop)

  // if the user included specific service numbers, filter out the rest of the services
    .then(result => {
      if (svc_nos.length > 0) {
        result.etas = result.etas.filter(eta => svc_nos.indexOf(eta.svcNo) !== -1);
      }

      // throw an error if there are no etas to be returned to the user
      if (result.etas.length === 0) {
        throw 'no_etas';
      }

      return result;
    })

    // format bus etas into a string
    .then(result => {
      let header;

      if (svc_nos.length === 0) {
        header = `Etas for bus stop ${bus_stop}`;
      } else {
        const services = result.etas.map(eta => eta.svcNo);
        const plural = services.length === 1 ? 'service' : 'services';
        header = `Etas for ${plural} ${services.join(', ')} at bus stop ${bus_stop}`;
      }

      const etas = [['Svc', 'Next', '2nd', '3rd']];
      for (const eta of result.etas) {
        etas.push([eta.svcNo, eta.next, eta.subsequent, eta.third]);
      }
      const etas_table = table(etas);

      const updated_time = `Last updated: ${moment(result.updated).tz('Asia/Singapore').format('lll')}.`;

      return `*${header}*\n\`\`\`\n${etas_table}\`\`\`\n_${updated_time}_`;
    })

    // create message
    .then(text => {
      const parse_mode = 'Markdown';
      const reply_markup = {
          inline_keyboard: [[
            {
              text: 'Refresh',
              callback_data: JSON.stringify({t: 'eta', a: [bus_stop, ...svc_nos].join(' ')})
            },
            {
              text: 'Done',
              callback_data: JSON.stringify({t: 'eta', d: true})
            }
          ]]
        };

      return {text, parse_mode, reply_markup};
    });
}

module.exports = eta_query_results;
