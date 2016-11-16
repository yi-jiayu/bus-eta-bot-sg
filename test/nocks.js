"use strict";

const nock = require('nock');

nock('https://api.telegram.org:443', {"encodedQueryParams": true})
  .post(`/bot${process.env.BOT_TOKEN}/sendMessage`, {
    "chat_id": 100710735,
    "text": "What is the number of the bus stop you would like etas for? You may optionally also include the specific bus services you're interested in. (Eg. `96049 2 24`)",
    "parse_mode": "Markdown"
  })
  .reply(200, {
    "ok": true,
    "result": {
      "message_id": 467,
      "from": {"id": 187530042, "first_name": "DevBuildBusEtaBot", "username": "DevBuildBusEtaBot"},
      "chat": {"id": 100710735, "first_name": "Jiayu", "username": "jiayu1", "type": "private"},
      "date": 1479039580,
      "text": "What is the number of the bus stop you would like etas for? You may optionally also include the specific bus services you're interested in. (Eg. 96049 2 24)",
      "entities": [{"type": "code", "offset": 145, "length": 10}]
    }
  },
    ['Server',
    'nginx/1.10.0',
    'Date',
    'Sun, 13 Nov 2016 12:19:40 GMT',
    'Content-Type',
    'application/json',
    'Content-Length',
    '447',
    'Connection',
    'close',
    'Access-Control-Allow-Origin',
    '*',
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS',
    'Access-Control-Expose-Headers',
    'Content-Length,Content-Type,Date,Server,Connection',
    'Strict-Transport-Security',
    'max-age=31536000; includeSubdomains']);

nock('http://datamall2.mytransport.sg:80', {"encodedQueryParams": true})
  .get('/ltaodataservice/BusArrival')
  .query({"BusStopID": "96049"})
  .reply(200, {
      "odata.metadata": "http://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrival/@Element",
      "BusStopID": "96049",
      "Services": [{
        "ServiceNo": "2",
        "Status": "In Operation",
        "Operator": "GAS",
        "OriginatingID": "99009",
        "TerminatingID": "10589",
        "NextBus": {
          "EstimatedArrival": "2016-11-13T12:24:19+00:00",
          "Latitude": "1.35358",
          "Longitude": "103.96743716666667",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": ""
        },
        "SubsequentBus": {
          "EstimatedArrival": "2016-11-13T12:33:47+00:00",
          "Latitude": "1.3865665",
          "Longitude": "103.97941366666667",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        },
        "SubsequentBus3": {
          "EstimatedArrival": "2016-11-13T12:40:20+00:00",
          "Latitude": "0",
          "Longitude": "0",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        }
      }, {
        "ServiceNo": "24",
        "Status": "In Operation",
        "Operator": "SBST",
        "OriginatingID": "54009",
        "TerminatingID": "54009",
        "NextBus": {
          "EstimatedArrival": "2016-11-13T12:23:47+00:00",
          "Latitude": "1.3434063333333333",
          "Longitude": "103.96916183333333",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        },
        "SubsequentBus": {
          "EstimatedArrival": "2016-11-13T12:38:15+00:00",
          "Latitude": "1.36197",
          "Longitude": "103.98953416666667",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        },
        "SubsequentBus3": {
          "EstimatedArrival": "2016-11-13T12:49:03+00:00",
          "Latitude": "1.3462343333333333",
          "Longitude": "103.96755583333334",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        }
      }, {
        "ServiceNo": "5",
        "Status": "In Operation",
        "Operator": "SBST",
        "OriginatingID": "77009",
        "TerminatingID": "10009",
        "NextBus": {
          "EstimatedArrival": "2016-11-13T12:28:07+00:00",
          "Latitude": "1.3620171666666667",
          "Longitude": "103.97158683333333",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        },
        "SubsequentBus": {
          "EstimatedArrival": "2016-11-13T12:42:06+00:00",
          "Latitude": "0",
          "Longitude": "0",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        },
        "SubsequentBus3": {
          "EstimatedArrival": "2016-11-13T12:57:06+00:00",
          "Latitude": "0",
          "Longitude": "0",
          "VisitNumber": "1",
          "Load": "Seats Available",
          "Feature": "WAB"
        }
      }]
    },
    ['Cache-Control', 'no-cache, no-store, max-age=0',
      'Content-Language',
      'en-US',
      'Content-Type',
      'application/json;charset=UTF-8',
      'Date',
      'Sun, 13 Nov 2016 12:22:09 GMT',
      'Expires',
      'Thu, 01 Jan 1970 00:00:00 GMT',
      'Pragma',
      'no-cache',
      'Server',
      'Apache-Coyote/1.1',
      'Content-Length',
      '2005',
      'Connection',
      'Close']);


