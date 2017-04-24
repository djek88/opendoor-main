const common = require('./components/common');
const prerenderService = require('./components/prerender-service');
const mail = require('./components/mail');
const apiKeys = require('./components/api-keys');
const social = require('./components/social');
const l10n = require('./components/l10n');
const googleAnalytics = require('./components/google-analytics');

module.exports = Object
  .assign({}, common, prerenderService, mail, apiKeys, social, l10n, googleAnalytics);
