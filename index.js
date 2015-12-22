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
var PlaceManager = require('./app/placemanager.js')(mongoose);
var placeManager = new PlaceManager;
var sha1 = require('sha1');

app.use(cookieParser(config.cookieKeys));
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


function showErrorPage(res, message) {
	jade.renderFile(__dirname + '/assets/templates/error.jade', {message: message}, function (err, html) {
		if (err) {
			console.log(err);
		}
		res.send(html);
	});
}



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
		res.redirect('/');
	}
	else {

		if(req.body.email && req.body.password) {
			userManager.find({email: req.body.email, password: sha1(req.body.password)}, function (err, users) {
				if (users.length) {
					var user = users[0];
					req.session.id = user._id;
					res.cookie('email', user.email);
					res.redirect('/');
				}
				else {
					res.redirect('/login?message=wrongloginorpassword');
				}
			});
		}
	}
});

app.get('/logout', function (req, res) {
	console.log( req.session.id);
	delete req.session.id;
	res.clearCookie('email');
	res.redirect('/');
});

app.post('/register', function (req, res) {
	if (req.session.loggedIn) {
		res.redirect('/');
	}
	else {
		if(req.body.email && req.body.password) {
			userManager.register({email: req.body.email, password: sha1(req.body.password)}, function (err, user) {
				if (err) {
					switch (err.message) {
						case 'alreadyregistered':
							res.redirect('/register?message=alreadyregistered');
						break;
						default:
							res.redirect('/error');
						break;
					}
				}
				else {
					res.redirect('/login?message=regsuccess');
				}
			});
		}
	}
});


app.get('/places/search', function (req, res) {
	placeManager.find(req.query, function(err, places){
		if (!err) {
			res.send(JSON.stringify(places));
		}
		else {
			res.send(JSON.stringify(err));
		}
	});
});

app.use(['/', '/login', '/register', '/error'], function(req, res) {
	jade.renderFile(__dirname + '/assets/templates/index.jade', function (err, content) {
		if (!err) {
			res.send(content);
		}
		else {
			console.log(err);
		}
	});
});