var config = require('./config.js');
var http = require('http');
var fs = require('fs');
var extend = require('util')._extend;
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


var getUniqueFileName = require('./app/utils.js').getUniqueFileName;

var UserManager = require('./app/usermanager.js')(mongoose);
var userManager = new UserManager;

var PlaceManager = require('./app/placemanager.js')(mongoose);
var placeManager = new PlaceManager;

var ReligionGroupManager = require('./app/religiongroupmanager.js')(mongoose);
var religionGroupManager = new ReligionGroupManager;

var DenominationManager = require('./app/denominationmanager.js')(mongoose);
var denominationManager = new DenominationManager;

global.religionGroupManager = religionGroupManager;
global.denominationManager = denominationManager;

var sha1 = require('sha1');

app.use(cookieParser(config.cookieKeys));
app.use(bodyParser.urlencoded({extended: false}));
app.use(busboy({ immediate: true}));
app.use(session({secret: config.sessionSecret}));

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

app.post('/login', function (req, res) {
	if (req.session.id) {
		res.redirect('/');
	}
	else {

		if(req.body.email && req.body.password) {
			userManager.find({email: req.body.email, password: sha1(req.body.password)}, function (err, users) {
				if (users.length) {
					var user = users[0];
					req.session.id = user._id;
					req.session.email = user.email;
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
	delete req.session.id;
	delete req.session.email;
	res.clearCookie('email');
	res.redirect('/');
});

app.post('/register', function (req, res) {
	if (req.session.id) {
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


app.get('/ajax/places/search', function (req, res) {
	placeManager.findNearby(req.query, function(err, places){
		if (!err) {
			res.send(JSON.stringify(places));
		}
		else {
			res.send(JSON.stringify(err));
		}
	});
});

app.get('/ajax/places/:id', function (req, res) {
	placeManager.getById(req.params.id, function(err, places){
		if (!err) {
			res.send(JSON.stringify(places));
		}
		else {
			res.send(JSON.stringify(err));
		}
	});
});

app.get('/ajax/religionGroups', function (req, res) {
	var query = extend({}, req.query);

	religionGroupManager.find(query, function(err, religionGroups){
		var groupNames= [];

		for (var i=0; i<religionGroups.length; i++) {
			groupNames.push(religionGroups[i].name);
		}
		res.send(JSON.stringify(groupNames));
	});
});


app.get('/ajax/denominations', function (req, res) {
	var query = req.query;

	denominationManager.find(query, function(err, religionGroups){
		var denominations = [];

		for (var i=0; i<religionGroups.length; i++) {
			denominations.push(religionGroups[i].name);
		}
		res.send(JSON.stringify(denominations));
	});
});


app.post('/feedback', function (req, res) {
	userManager.find({isAdmin: true}, function(err, users){
		if (err) {
			console.log(err);
		}
		else {
			var adminEmails = [];
			for (var i=0; i<users.length; i++) {
				var user = users[i];
				if (user.email) {
					adminEmails.push(user.email);
				}
			}
			console.log(adminEmails);
			var mailText = 'User: ' + req.body.name +
											'\nEmail: ' + req.body.email +
											'\nTarget page: ' + req.body.target +
											'\nNote: ' + req.body.note;
			var mailOptions = {
				from: config.mailConfig.senderAddress, // sender address
				to: adminEmails.join(', '), // list of receivers
				subject: 'Feedback about OpenDoor', // Subject line
				text: mailText
				//html: '<b>Hello world ✔</b>' // html body
			};

			// send mail with defined transport object
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					return console.log(error);
				}
				console.log('Message sent: ' + info.response);

			});
		}
	});

	res.redirect('/message?message=feedbacksaved');
	res.end();
});

app.post(['/places/add', '/places/edit/:id'], function (req, res) {
	var isAdding = !req.params.id;
	var fields = {};
	var imagesPath = '/photos/';
	var files = {};

	var allowedFileFields = ['leaderPhoto', 'bannerPhoto'];
	var allowedFileExtensions = ['jpg', 'png'];

	function finishRequest(id) {
		if (isAdding){
			var userMail = req.session.email;
			var mailText = 'Thank you for adding a place!\n' +
				'Please confirm it by passing the link: ' +
				config.url + '/places/confirm/' + id;
			var mailOptions = {
				from: config.mailConfig.senderAddress,
				to: userMail,
				subject: 'Place confirmation',
				text: mailText
			};

			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					return console.log(error);
				}
				console.log('Message sent: ' + info.response);

			});
			res.redirect('/message?message=placeadded');
		}
		else {
			res.redirect('/message?message=placesaved');
		}
		res.end();
	}

	function storePlace() {
		var data = extend({}, fields);
		var data = extend(data, files);
		data.location = {coordinates: fields.location.split(',')};
		data.isConfirmed = false;

		if (data.denominations) {
			data.denominations = data.denominations.split(',');
		}

		if (data.mainMeetingTime) {
			data.mainMeetingTime = new Date(data.mainMeetingTime + ' 01.01.1970');
		}

		placeManager.dropUndeclaredFields(data);
		if (isAdding) {
			placeManager.add(data, finishRequest);
		}
		else {
			placeManager.update(req.params.id, data, finishRequest);
		}
	}


	if (req.busboy) {
		req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			if (filename.length) {
				var extension = filename.toLowerCase().split('.').pop();
				if (allowedFileFields.indexOf(fieldname) != -1 && allowedFileExtensions.indexOf(extension) != -1) {
					var imgFileName = files[fieldname] = imagesPath + getUniqueFileName() + '.' + extension;
					var fstream = fs.createWriteStream(__dirname + imgFileName);
					file.pipe(fstream);
				}
				else {
					console.warn('wrong extendion or field name:', fieldname, extension);
				}
			}
			file.resume();
		});
		req.busboy.on('field', function(key, value) {
			fields[key] = value;
		});
		req.busboy.on('finish', storePlace);
	}
	else {
		res.end();
	}
});


app.get('/places/review/:id', function (req, res) {
	if (req.session.email) {
		var id = req.params.id;
		var data = req.query;
		data.email = req.session.email;
		placeManager.dropUndeclaredFields(data);
		console.log(data);
		placeManager.addReview(id, data, function(err, place){
			console.log (err ,place);
			if (!err && place) {
				console.log('Review for place ' + id + ' was added');
				res.redirect('/message?message=reviewsaved');
			}
			else {
				res.redirect('/error');
			}
		});
	}
});

app.get('/places/confirm/:id', function (req, res) {
	var id = req.params.id;
	placeManager.markAsConfirmed(id, function(err, place){
		console.log (err ,place);
		if (!err && place) {
			console.log('Place with ' + id + ' was confirmed');
			res.redirect('/message?message=placeconfirmed');
		}
		else {
			res.redirect('/error?message=placeconfirmationerror');
		}
	});
});

app.use(function(req, res) {
	if (req.xhr) {
		res.status(404).end();
	}
	else {
		jade.renderFile(__dirname + '/assets/templates/index.jade', {apiKeys: config.apiKeys}, function (err, content) {
			if (!err) {
				res.send(content);
			}
			else {
				console.log(err);
			}
		});
	}
});