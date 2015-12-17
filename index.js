var c = console.log.bind(console);
var config = require('./config.js');
var http = require('http');
var querystring = require('querystring');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var db = mongoose.connection;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var jade = require('jade');
var UserManager = require('./app/usermanager.js')(mongoose);
var userManager = new UserManager;

app.use(cookieParser({keys: config.cookieKeys}));
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({secret: config.sessionSecret}));

mongoose.connect(config.mongoURI);


app.use('/bower_components', express.static('bower_components'));
app.use('/assets', express.static('assets'));


db.on('error', console.error);
db.once('open', function () {
	var server = app.listen(config.port, function () {
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

app.post('/login', function (req, res) {
	if (req.session.loggedIn) {
		res.redirect('/find');
	}
	else {
		userManager.find(req.body, function (err, users) {
			if (users.length) {
				res.redirect('/');
			}
			else {
				res.redirect('/login');
			}
		});
	}
});

app.post('/register', function (req, res) {
	if (req.session.loggedIn) {
		res.redirect('/find');
	}
	else {
		userManager.register(req.body, function (err, user) {
			res.redirect('/login');
		});
	}
});

app.use(function(req, res) {
	jade.renderFile(__dirname + '/assets/templates/index.jade', function (err, content) {
		if (err) {
			console.log(err);
		}
		res.send(content);
	});
});