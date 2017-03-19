const http = require('http');
const querystring = require('querystring');
const config = require('../config');

module.exports.sendEvent = function(opt) {
	if (!opt._ga || typeof opt._ga !== 'string') {
		console.error('"_ga" cookie required, must be string!');
		return;
	}

	const clientId = opt._ga.split('.').slice(-2).join('.');
	const postData = querystring.stringify({
		v: 1,
		t: 'event',
		tid: config.googleAnalytics.trackingId,
		cid: clientId,
		ec: opt.eventCategory,
		ea: opt.eventAction
	});

	http.request({
		hostname: 'www.google-analytics.com',
		path: '/collect',
		method: 'POST'
	}).end(postData);
};