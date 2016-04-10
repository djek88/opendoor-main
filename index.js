
var config = require('./config.js');
var http = require('http');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var express = require('express');
var nodemailer = require('nodemailer');
var app = express();
var mongoose = require('mongoose');
var db = mongoose.connection;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var busboy = require('connect-busboy');
var jade = require('jade');
var sha1 = require('sha1');
var schedule = require('node-schedule');
var stripe = require("stripe")(config.apiKeys.stripeSecret);
var sendPlaceReminder = require('./app/schedule/sendplacereminder.js');
var countryList = require('country-list')();
var sm = require('sitemap');

require('./assets/js/utils.js');
require('./app/date.min.js');

var lastFileName = (new Date).getTime();
function getUniqueFilename() {
	return lastFileName++;
}
global.getUniqueFilename = getUniqueFilename;

global.appDir = path.dirname(require.main.filename);
global.imagesPath = '/photos/';

if (config.mailConfig.transport == 'gmail') {
	var transporter = nodemailer.createTransport(config.mailConfig);
}
else if (config.mailConfig.transport == 'smtp') {
	var smtpTransport = require('nodemailer-smtp-transport');
	var transporter = nodemailer.createTransport(smtpTransport(config.mailConfig));
}
else {
	console.err("No valid transport was found");
	process.exit(1);
}
var currentYear;
function setYear(){
	currentYear = (new Date).getFullYear();
}
setYear();

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

var siteconfig = {
	sitename: config.sitename
	, url: config.url
	, imagesPath: global.imagesPath
	, twitterAccount: config.social.twitterAccount
	, apiKeys: {
		stripePublic: config.apiKeys.stripePublic
		, googleMaps: config.apiKeys.googleMaps
	}
	, frontend: config.frontend
	, l10n: config.l10n
};


var frontendPages = [
	'/'
	,	'/login'
	,	'/register'
	,	'/feedback'
	,	'/about'
	,	'/error'
	,	'/message'
	,	'/notfound'
	,	'/subscribefornotification'
	,	'/places/add'
	,	'/places/claims'
	,	'/places/changes'
	,	'/places/edit/:id'
	,	'/places/list'
	,	'/places/last'
	,	'/users/list'
	,	'/users/:id'
	,	'/promotion/:id'
	,	'/places/maintained'
	,	'/places/'
	,	'/places/:country/'
	,	'/places/:country/:locality/'
	,	'/places/review/:id'
	,	'/places/donate/:id'
	,	'/places/event/:id/add'
	,	'/places/editorproposal/:id'
	//, /\/places\/(.*)/
	,	'/jobs/search'
	, '/jobs/add'
	,	'/jobs/:id'
	, '/jobs/edit/:id'
	, '/jobs/fund/:id'
];

var placesFrontEndPages = [
		'/places/:id'
	, '/places/:country/:region/:locality/:religion/:groupName/:name'
];
if (config.prerenderServiceUrl) {
	app.use(require('prerender-node')
		.set('prerenderServiceUrl', config.prerenderServiceUrl)
		.set('host', config.hostname + ':' + config.port)
		.set('protocol', 'http'));
}
app.set('view options', { pretty: true });
app.use(cookieParser(config.cookieKeys));
app.use(bodyParser.urlencoded({extended: false}));
app.use(busboy({ immediate: true}));
app.use(session({secret: config.sessionSecret}));



mongoose.connect(config.mongoURI);


app.use('/bower_components', express.static('bower_components'));
app.use('/assets', express.static('assets'));
app.use('/photos', express.static('photos'));
app.use('/favicon.ico', express.static('assets/img/favicon.ico'));
app.use('/generateSitemap', require('./app/sitemap.js')(placeManager, sm, config, fs, path));
app.use(config.staticFiles, function(req, res){
	var filename = path.join(__dirname, 'static', req.baseUrl);
	fs.stat(filename, function(err, stats){
		if (stats) {
			if (filename.match(/\.xml$/)) {
				res.set('Content-Type', 'text/xml');
			}
			res.sendFile(filename);
		}
		else {
			res.status(404);
			res.end();
		}
	});
});

db.on('error', console.error);
db.once('open', function () {
	var server = app.listen(config.port, config.hostname, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('App listening at http://%s:%s', host, port);
	});
});
app.use(function(req, res, next) {
	res.header('Expires', (new Date(0).toGMTString()));
	next();
});


app.get('/assets/templates/partials/:filename.html', function (req, res) {
	jade.renderFile(__dirname + '/assets/templates/partials/' + req.params.filename + '.jade', function (err, html) {
		if (err) {
			console.log(err);
		}
		res.send(html);
	});

});


app.get('/siteconfig.js', require('./app/routes/siteconfig.js')(siteconfig));

app.post('/login', require('./app/routes/login.js')(userManager, sha1));
app.get('/logout', require('./app/routes/logout.js')());
app.post('/register', require('./app/routes/register.js')(userManager, sha1));


app.get('/ajax/users', require('./app/routes/ajax/users.js')(userManager));
app.get('/ajax/users/:id', require('./app/routes/ajax/findoneuser.js')(userManager));
app.get('/ajax/places/search', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/geosearch', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/maintained', require('./app/routes/ajax/places/maintained.js')(config, mongoose, placeManager));
app.get('/ajax/places/maintained/:id', require('./app/routes/ajax/places/maintained.js')(config, mongoose, placeManager));
app.get('/ajax/places/last', require('./app/routes/ajax/places/last.js')(config, placeManager));
app.get(/\/ajax\/places\/(.*)/, require('./app/routes/ajax/places/findone.js')(mongoose, placeManager)); //keep this route at bottom of all other ones which are /ajax/places/* because this one is greedy
app.get(['/ajax/jobs/:id', '/ajax/jobs/search'], require('./app/routes/ajax/jobs.js')(mongoose, placeManager));

app.get('/ajax/placechanges', require('./app/routes/ajax/places/changes.js')(mongoose, placeManager, placeChangeManager));

app.get('/places/confirm/:id', require('./app/routes/places/confirm.js')(placeManager));
app.get('/subscriptions/confirm/:id', require('./app/routes/subscriptions/confirm.js')(subscriptionManager));

app.get('/ajax/countries', require('./app/routes/ajax/countries.js')(placeManager, countryList));
app.get('/ajax/localities', require('./app/routes/ajax/localities.js')(placeManager));
app.get('/ajax/religionGroups', require('./app/routes/ajax/religionGroups.js')(religionGroupManager));
app.get('/ajax/denominations', require('./app/routes/ajax/denominations.js')(denominationManager));
app.get('/ajax/claims', require('./app/routes/ajax/claims.js')(claimManager));


app.post(['/jobs/add', '/jobs/edit/:id'], require('./app/routes/jobs/edit.js')(mongoose, placeManager, placeManager));
app.post('/jobs/fund/:id', require('./app/routes/jobs/fund.js')(placeManager, stripe));
app.post('/jobs/:id', require('./app/routes/jobs/contact.js')(mongoose, placeManager, email));
app.post(['/places/add', '/places/edit/:id'], require('./app/routes/places/edit.js')(mongoose, userManager, placeChangeManager, placeNotificationManager, email));
app.post('/places/editorproposal/:id', require('./app/routes/places/editorproposal.js')(email));
app.post('/places/review/:id', require('./app/routes/places/addreview.js')(placeManager));
app.post('/places/donate/:id', require('./app/routes/promotion.js')(placeManager, stripe));
app.post('/places/event/:id/add', require('./app/routes/places/addevent.js')(placeManager));
app.get('/places/uptodate/:id', require('./app/routes/places/uptodate.js')(placeManager));
app.post('/places/message', require('./app/routes/places/message.js')(placeManager, email));
app.post('/places/subscribe', require('./app/routes/subscriptions/subscribe.js')(subscriptionManager, placeManager, email));
app.post('/feedback', require('./app/routes/feedback.js')(userManager, config, email));

app.get('/claims/:id/add', require('./app/routes/claims/add.js')(mongoose, claimManager, placeManager));
app.get('/claims/:id/accept', require('./app/routes/claims/accept.js')(claimManager));
app.get('/claims/:id/deny', require('./app/routes/claims/deny.js')(claimManager));


app.get('/placechanges/:id/accept', require('./app/routes/placechanges/accept.js')(placeChangeManager));
app.get('/placechanges/:id/deny', require('./app/routes/placechanges/deny.js')(placeChangeManager));


app.post('/subscribefornotification', require('./app/routes/subscribefornotification.js')(placeNotificationManager));


app.get(frontendPages, function(req, res) {
	var options = {
		apiKeys: config.apiKeys
		, pretty: true
		, currentYear: currentYear
		, originalCss: req.query.originalCss
	};
	jade.renderFile(__dirname + '/assets/templates/index.jade', options, function (err, content) {
		if (!err) {
			res.send(content);
		}
		else {
			console.log(err);
		}
	});
});

app.get(placesFrontEndPages, function(req, res) {
	var query = {};
	if (req.params.country) {
		query.uri = req.path.substr(8);
	}
	else {
		query._id = req.params.id;
	}
	placeManager.findOne(query, function(err, place){
		var options = {
				apiKeys: config.apiKeys
			, isPlace: true
			, place: place
			, siteconfig: siteconfig
			, pretty: true
			, currentYear: currentYear
			, originalCss: req.query.originalCss
		};
		jade.renderFile(__dirname + '/assets/templates/index.jade', options, function (err, content) {
			if (!err) {
				res.send(content);
			}
			else {
				console.log(err);
			}
		});
	});
});


schedule.scheduleJob('* * 0 * * *', sendPlaceReminder(placeManager, email));

schedule.scheduleJob('* * 0 * * *', setYear);