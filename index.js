'use strict';

var config = require('./config');
var http = require('http');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var express = require('express');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var busboy = require('connect-busboy');
var jade = require('jade');
var schedule = require('node-schedule');
var stripe = require("stripe")(config.apiKeys.stripeSecret);
var sendPlaceReminder = require('./app/schedule/sendplacereminder.js');
var sm = require('sitemap');

require('./assets/js/utils.js');
require('./app/date.min.js');

mongoose.connect(config.mongoURI);

var app = express();
var transporter;

mongoose.connection
	.once('open', function () {
		var server = http.createServer(app);

		server.listen(config.port, config.hostname);
		server.on('error', function(error) {
			if (error.syscall !== 'listen') {
				throw error;
			}

			var bind = typeof port === 'string'
				? 'Pipe ' + port
				: 'Port ' + port;

			// handle specific listen errors with friendly messages
			switch (error.code) {
				case 'EACCES':
					console.error(bind + ' requires elevated privileges');
					process.exit(1);
					break;
				case 'EADDRINUSE':
					console.error(bind + ' is already in use');
					process.exit(1);
					break;
				default:
					throw error;
			}
		});
		server.on('listening', function() {
			var addr = server.address();
			var bind = typeof addr === 'string'
				? 'pipe ' + addr
				: 'port ' + addr.port;
			console.log('Listening on ' + bind);
		});
	})
	.on('error', console.error);

if (config.mailConfig.transport == 'gmail') {
	transporter = nodemailer.createTransport(config.mailConfig);
} else if (config.mailConfig.transport == 'smtp') {
	var smtpTransport = require('nodemailer-smtp-transport');
	transporter = nodemailer.createTransport(smtpTransport(config.mailConfig));
} else {
	console.err("No valid transport was found");
	process.exit(1);
}

var Email = require('./app/email.js');
var email = new Email(config, transporter);

var UserManager = require('./app/usermanager.js')(mongoose, config);
var userManager = new UserManager;

var PlaceManager = require('./app/placemanager.js')(mongoose, email, config);
var placeManager = new PlaceManager;

var ReligionGroupManager = require('./app/religiongroupmanager.js')(mongoose);
var religionGroupManager = new ReligionGroupManager;

var DenominationManager = require('./app/denominationmanager.js')(mongoose);
var denominationManager = new DenominationManager;

var ClaimManager = require('./app/claimmanager.js')(mongoose, email);
var claimManager = new ClaimManager;

var PlaceChangeManager = require('./app/placechangemanager.js')(mongoose);
var placeChangeManager = new PlaceChangeManager;

var PlaceNotificationManager = require('./app/placenotificationmanager.js')(mongoose);
var placeNotificationManager = new PlaceNotificationManager;

var SubscriptionManager = require('./app/subscriptionmanager.js')(mongoose);
var subscriptionManager = new SubscriptionManager;

global.userManager = userManager;
global.placeManager = placeManager;
global.religionGroupManager = religionGroupManager;
global.denominationManager = denominationManager;
global.placeNotificationManager = placeNotificationManager;
global.getUniqueFilename = getUniqueFilename;
global.appDir = path.dirname(require.main.filename);
global.imagesPath = '/photos/';

var siteconfig = {
	sitename: config.sitename,
	url: config.url,
	imagesPath: global.imagesPath,
	twitterAccount: config.social.twitterAccount,
	frontend: config.frontend,
	l10n: config.l10n,
	googleAnalytics: {
		trackingId: config.googleAnalytics.trackingId
	},
	apiKeys: {
		stripePublic: config.apiKeys.stripePublic,
		googleMaps: config.apiKeys.googleMaps,
	}
};

if (config.prerenderService.enable) {
	var prerender = require('./app/prerenderservice');
	prerender.runServer();

	app.use(prerender);
}

app.set('view options', {pretty: true});
app.use(cookieParser(config.cookieKeys));
app.use(bodyParser.urlencoded({extended: false}));
app.use(busboy({immediate: true}));
app.use(session({secret: config.sessionSecret}));
app.use('/bower_components', express.static('bower_components'));
app.use('/assets', express.static('assets'));
app.use('/photos', express.static('photos'));
app.use('/favicon.ico', express.static('assets/img/favicon.ico'));
app.use('/robots.txt', express.static('robots.txt'));
app.use('/generateSitemap', require('./app/routes/sitemap.js')(placeManager, sm, config, fs, path));
app.use('/mailingList', require('./app/routes/mailinglist.js')(subscriptionManager, sm, config, fs, path));
app.use(config.staticFiles, function(req, res){
	var filename = path.join(__dirname, 'static', req.baseUrl);
	fs.stat(filename, function(err, stats){
		if (stats) {
			if (filename.match(/\.xml$/)) {
				res.set('Content-Type', 'text/xml');
			}
			res.sendFile(filename);
		} else {
			res.status(404);
			res.end();
		}
	});
});
app.use(function(req, res, next) {
	res.header('Expires', (new Date(0).toGMTString()));
	next();
});


app.get('/assets/templates/partials/:filename.html', function (req, res) {
	jade.renderFile(__dirname + '/assets/templates/partials/' + req.params.filename + '.jade', function(err, html) {
		if (err) return console.log(err);

		res.send(html);
	});
});

app.get('/siteconfig.js', require('./app/routes/siteconfig.js')(siteconfig));
app.post('/register', require('./app/routes/register.js')(userManager));
app.post('/login', require('./app/routes/login.js')(userManager));
app.get('/logout', require('./app/routes/logout.js')());

app.get('/ajax/users', require('./app/routes/ajax/users.js')(userManager));
app.get('/ajax/users/:id', require('./app/routes/ajax/findoneuser.js')(userManager));
app.get('/ajax/places/search', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/geosearch', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/searchbyip', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/maintained', require('./app/routes/ajax/places/maintained.js')(config, mongoose, placeManager));
app.get('/ajax/places/maintained/:id', require('./app/routes/ajax/places/maintained.js')(config, mongoose, placeManager));
app.get('/ajax/places/last', require('./app/routes/ajax/places/last.js')(config, placeManager));
app.get(/\/ajax\/places\/(.*)/, require('./app/routes/ajax/places/findone.js')(mongoose, placeManager)); //keep this route at bottom of all other ones which are /ajax/places/* because this one is greedy
app.get(['/ajax/jobs/:id', '/ajax/jobs/search'], require('./app/routes/ajax/jobs.js')(mongoose, placeManager));
app.get(['/ajax/events/:id', '/ajax/events/search'], require('./app/routes/ajax/events.js')(mongoose, placeManager, config));
app.get('/ajax/placechanges', require('./app/routes/ajax/places/changes.js')(mongoose, placeManager, placeChangeManager));
app.get('/ajax/countries', require('./app/routes/ajax/countries.js')(placeManager));
app.get('/ajax/localities', require('./app/routes/ajax/localities.js')(placeManager));
app.get('/ajax/religionGroups', require('./app/routes/ajax/religionGroups.js')(religionGroupManager));
app.get('/ajax/denominations', require('./app/routes/ajax/denominations.js')(denominationManager));
app.get('/ajax/claims', require('./app/routes/ajax/claims.js')(claimManager));

app.get('/subscriptions/confirm/:id', require('./app/routes/subscriptions/confirm.js')(subscriptionManager));
app.post(['/jobs/add', '/jobs/edit/:id'], require('./app/routes/jobs/edit.js')(mongoose, placeManager, placeManager));
app.post('/jobs/fund/:id', require('./app/routes/jobs/fund.js')(placeManager, stripe));
app.post('/jobs/:id', require('./app/routes/jobs/contact.js')(mongoose, placeManager, email));

app.get('/places/confirm/:id', require('./app/routes/places/confirm.js')(placeManager));
app.post(['/places/add', '/places/edit/:id'], require('./app/routes/places/edit.js')(mongoose, userManager, placeChangeManager, placeNotificationManager, email));
app.post('/places/editorproposal/:id', require('./app/routes/places/editorproposal.js')(email));
app.post('/places/review/:id', require('./app/routes/places/addreview.js')(placeManager));
app.post('/places/donate/:id', require('./app/routes/promotion.js')(placeManager, stripe));
app.get('/places/uptodate/:id', require('./app/routes/places/uptodate.js')(placeManager));
app.post('/places/message', require('./app/routes/places/message.js')(placeManager, email));
app.post('/places/subscribe', require('./app/routes/subscriptions/subscribe.js')(subscriptionManager, placeManager, email));

app.post(['/events/add', '/events/:id/edit'], require('./app/routes/places/upsertevent.js')(placeManager, mongoose));
app.post('/feedback', require('./app/routes/feedback.js')(userManager, config, email));
app.get('/claims/:id/add', require('./app/routes/claims/add.js')(mongoose, claimManager, placeManager));
app.get('/claims/:id/accept', require('./app/routes/claims/accept.js')(claimManager));
app.get('/claims/:id/deny', require('./app/routes/claims/deny.js')(claimManager));
app.get('/placechanges/:id/accept', require('./app/routes/placechanges/accept.js')(placeChangeManager, email));
app.get('/placechanges/:id/deny', require('./app/routes/placechanges/deny.js')(placeChangeManager, email));
app.post('/subscribefornotification', require('./app/routes/subscribefornotification.js')(placeNotificationManager));
app.get('/version', function(req, res) { res.send('1.0.1'); });

var frontendPages = [
	'/',
	'/login',
	'/tools',
	'/register',
	'/feedback',
	'/about',
	'/error',
	'/message',
	'/notfound',
	'/subscribefornotification',
	'/places/',
	'/places/list',
	'/places/last',
	'/places/add',
	'/places/claims',
	'/places/changes',
	'/places/edit/:id',
	'/users/list',
	'/users/:id',
	'/promotion/:id',
	'/places/maintained',
	'/places/:country/',
	'/places/:country/:locality/',
	'/places/review/:id',
	'/places/donate/:id',
	'/places/editorproposal/:id',
	///\/places\/(.*)/,
	'/events/add',
	'/events/search',
	'/events/:id/edit',
	'/jobs/search',
	'/jobs/add',
	'/jobs/:id',
	'/jobs/edit/:id',
	'/jobs/fund/:id'
];

app.get(frontendPages, function(req, res) {
	var options = {
		apiKeys: config.apiKeys,
		pretty: true,
		currentYear: (new Date).getFullYear(),
		originalCss: req.query.originalCss,
		userIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress
	};

	jade.renderFile(__dirname + '/assets/templates/index.jade', options, function(err, content) {
		if (err) return console.log(err);

		res.send(content);
	});
});

var placesFrontEndPages = [
	'/places/:id',
	'/places/:country/:region/:locality/:religion/:groupName/:name'
];

app.get(placesFrontEndPages, function(req, res) {
	var query = {};

	if (req.params.country) {
		query.uri = req.path.substr(8);
	} else {
		query._id = req.params.id;
	}

	placeManager.findOne(query, function(err, place) {
		if (err || !place) return res.sendStatus(404);

		var options = {
			apiKeys: config.apiKeys,
			isPlace: true,
			place: place,
			siteconfig: siteconfig,
			pretty: true,
			currentYear: (new Date).getFullYear(),
			originalCss: req.query.originalCss
		};

		jade.renderFile(__dirname + '/assets/templates/index.jade', options, function(err, content) {
			if (err) return console.log(err);

			res.send(content);
		});
	});
});

// schedule.scheduleJob('* * 0 * * *', sendPlaceReminder(placeManager, email));
// schedule.scheduleJob('* * 0 * * *', setYear);

var lastFileName = Date.now();
function getUniqueFilename() {
	return lastFileName++;
}