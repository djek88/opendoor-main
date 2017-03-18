'use strict';

const config = require('../config');

var prerender = require('prerender');
var server = prerender({
	workers: config.prerenderService.instances
});

server.start();