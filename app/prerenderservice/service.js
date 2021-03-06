const spawn = require('child_process').spawn;
const prerenderService = require('prerender-node');
const config = require('../config');

const prerenderServerUrl = `http://localhost:${config.prerenderService.port}`;
const applicationHost = `${config.hostname}:${config.port}`;
let serverProcess;

module.exports = prerenderService;

prerenderService
  .set('prerenderServiceUrl', prerenderServerUrl)
  .set('host', applicationHost)
  .set('protocol', 'http');

prerenderService.runServer = function runServer() {
  if (serverProcess) return;

  serverProcess = spawn(process.argv[0], ['./app/prerenderservice/server.js'], {
    env: { PORT: config.prerenderService.port, NODE_HOSTNAME: 'localhost' },
    // stdio: 'inherit' // uncomment for see prerender service's logs
  });

  serverProcess.unref();

  process.on('exit', () => serverProcess.kill('SIGHUP'));
};
