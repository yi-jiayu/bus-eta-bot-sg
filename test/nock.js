"use strict";

const nock = require('nock');

nock.recorder.rec();

exports.handler = require('../src/main').handler;
