const config = require('../config');
const prerender = require('prerender');

const server = prerender({
  workers: config.prerenderService.instances,
});

server.start();
