var config = require('./config.js');
var http = require('http');
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
require('./assets/js/utils.js');

var UserManager = require('./app/usermanager.js')(mongoose);
var userManager = new UserManager;

var PlaceManager = require('./app/placemanager.js')(mongoose);
var placeManager = new PlaceManager;

var ReligionGroupManager = require('./app/religiongroupmanager.js')(mongoose);
var religionGroupManager = new ReligionGroupManager;

var DenominationManager = require('./app/denominationmanager.js')(mongoose);
var denominationManager = new DenominationManager;

var ClaimManager = require('./app/claimmanager.js')(mongoose);
var claimManager = new ClaimManager;

var PlaceChangeManager = require('./app/placechangemanager.js')(mongoose);
var placeChangeManager = new PlaceChangeManager;

global.userManager = userManager;
global.placeManager = placeManager;
global.religionGroupManager = religionGroupManager;
global.denominationManager = denominationManager;



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

var Email = require('./app/email.js');
var email = new Email(config, transporter);


var frontendPages = [
	'/'
	,	'/login'
	,	'/register'
	,	'/feedback'
	,	'/about'
	,	'/error'
	,	'/message'
	,	'/notfound'
	,	'/places/add'
	,	'/places/claims'
	,	'/places/changes'
	,	'/places/edit/:id'
	,	'/places/last'
	,	'/places/maintained'
	,	'/places/review/:id'
	, /\/places\/(.*)/
];

app.use(cookieParser(config.cookieKeys));
app.use(bodyParser.urlencoded({extended: false}));
app.use(busboy({ immediate: true}));
app.use(session({secret: config.sessionSecret}));


mongoose.connect(config.mongoURI);


app.use('/bower_components', express.static('bower_components'));
app.use('/assets', express.static('assets'));
app.use('/photos', express.static('photos'));
app.use('/favicon.ico', express.static('favicon.ico'));


db.on('error', console.error);
db.once('open', function () {
	var server = app.listen(config.port, config.hostname, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('App listening at http://%s:%s', host, port);
	});
});



app.get('/assets/templates/partials/:filename.html', function (req, res) {
	jade.renderFile(__dirname + '/assets/templates/partials/' + req.params.filename + '.jade', function (err, html) {
		if (err) {
			console.log(err);
		}
		res.send(html);
	});

});

app.post('/login', require('./app/routes/login.js')(userManager, sha1));
app.get('/logout', require('./app/routes/logout.js')());
app.post('/register', require('./app/routes/register.js')(userManager, sha1));


app.get('/ajax/places/search', require('./app/routes/ajax/places/search.js')(placeManager));
app.get('/ajax/places/maintained', require('./app/routes/ajax/places/maintained.js')(mongoose, placeManager));
app.get('/ajax/places/last', require('./app/routes/ajax/places/last.js')(placeManager));
app.get(/\/ajax\/places\/(.*)/, require('./app/routes/ajax/places/find.js')(mongoose, placeManager)); //keep this route at bottom of all other ones which are /ajax/places/* because this one is greedy

app.get('/ajax/placechanges', require('./app/routes/ajax/places/changes.js')(mongoose, placeManager, placeChangeManager));

app.get('/places/confirm/:id', require('./app/routes/places/confirm.js')(placeManager));

app.get('/ajax/religionGroups', require('./app/routes/ajax/religionGroups.js')(religionGroupManager));
app.get('/ajax/denominations', require('./app/routes/ajax/denominations.js')(denominationManager));
app.get('/ajax/claims', require('./app/routes/ajax/claims.js')(claimManager));


app.post(['/places/add', '/places/edit/:id'], require('./app/routes/places/edit.js')(mongoose, userManager, placeChangeManager, email));
app.post('/places/review/:id', require('./app/routes/places/review.js')(placeManager));
app.post('/places/message', require('./app/routes/places/message.js')(placeManager, email));
app.post('/feedback', require('./app/routes/feedback.js')(userManager, email));

app.get('/claims/:id/add', require('./app/routes/claims/add.js')(mongoose, claimManager));
app.get('/claims/:id/accept', require('./app/routes/claims/accept.js')(claimManager));
app.get('/claims/:id/deny', require('./app/routes/claims/deny.js')(claimManager));


app.get('/placechanges/:id/accept', require('./app/routes/placechanges/accept.js')(claimManager));
app.get('/placechanges/:id/deny', require('./app/routes/placechanges/deny.js')(claimManager));





app.get(frontendPages, function(req, res) {
	jade.renderFile(__dirname + '/assets/templates/index.jade', {apiKeys: config.apiKeys}, function (err, content) {
		if (!err) {
			res.send(content);
		}
		else {
			console.log(err);
		}
	});
});