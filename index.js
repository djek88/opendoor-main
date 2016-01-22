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

global.placeManager = placeManager;
global.religionGroupManager = religionGroupManager;
global.denominationManager = denominationManager;

var sha1 = require('sha1');



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
	if (req.session.user) {
		res.redirect('/');
	}
	else {
		if(req.body.email && req.body.password) {
			userManager.findOne({email: req.body.email, password: sha1(req.body.password)}, function (err, user) {
				if (user) {
					req.session.user = user;
					res.cookie('_id', user._id);
					res.cookie('email', user.email);
					res.cookie('isAdmin', user.isAdmin);
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
	delete req.session.user;
	res.clearCookie('_id');
	res.clearCookie('email');
	res.clearCookie('isAdmin');
	res.redirect('/');
});

app.post('/register', function (req, res) {
	if (req.session.user) {
		res.redirect('/');
	}
	else {
		if(req.body.email && req.body.password) {
			userManager.register({name: req.body.name, email: req.body.email, password: sha1(req.body.password)}, function (err, user) {
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
	var data = {
			coordinates: [
					parseFloat(req.query.lat)
				, parseFloat(req.query.lng)
			]
		,	religion: req.query.religion
		,	maxDistance: req.query.maxDistance
	};
	placeManager.findNearby(data, function(err, places){
		if (!err) {
			res.send(JSON.stringify(places));
		}
		else {
			res.send(JSON.stringify(err));
		}
	});
});


app.get('/ajax/places/maintained', function (req, res) {
	if (req.session.user) {
		placeManager.find({maintainer: mongoose.Types.ObjectId(req.session.user._id)}).populate('maintainer', 'name').exec(function (err, places) {
			if (!err) {
				res.send(JSON.stringify(places));
			}
			else {
				res.send(JSON.stringify(err));
			}
		});
	}
});

app.get('/ajax/places/last', function (req, res) {
	placeManager.find({}).skip('-createdAt').limit(5).populate('maintainer', 'name').exec(function(err, place){
		if (!err) {
			res.send(JSON.stringify(place));
		}
		else {
			res.send(JSON.stringify(err));
		}
	});
});


app.get('/places/confirm/:id', function (req, res) {
	var id = req.params.id;
	placeManager.markAsConfirmed(id, function(err, place){
		if (!err && place) {
			console.log('Place with ' + id + ' was confirmed');
			res.redirect('/message?message=placeconfirmed');
		}
		else {
			res.redirect('/error?message=placeconfirmationerror');
		}
	});
});


app.get('/places/claim/:id', function (req, res) {
	if (req.session.user) {
		var placeId = req.params.id;
		var data = {
			user: mongoose.Types.ObjectId(req.session.user._id)
			, place: mongoose.Types.ObjectId(placeId)
		};

		claimManager.add(data, function(err, place){
			if (!err && place) {
				console.log('Claim for place ' + placeId + ' was added');
				res.redirect('/message?message=claimadded');
			}
			else {
				res.redirect('/error');
			}
		});
	}
});

app.get(/\/ajax\/places\/(.*)/, function (req, res) { //keep this route at bottom of all other ones which are /ajax/places/* because this one is greedy
	var id = req.params[0];
	if (id.indexOf('/') != -1) { //it seems to be uri
		var query = {uri: id};
	}
	else {
		var query = {_id: mongoose.Types.ObjectId(id)};
	}
	placeManager.findOne(query).populate('maintainer', 'name').exec(function(err, place){
		if (!err) {
			res.send(JSON.stringify(place));
		}
		else {
			res.send(JSON.stringify(err));
		}
	});
});

app.get('/ajax/placechanges', function (req, res) {
	if (req.session.user) {
		placeManager.find({maintainer: mongoose.Types.ObjectId(req.session.user._id)}).select('_id').exec(function (err, places) {
			if (!err) {
				var ids = [];
				for (var i=0; i<places.length; i++) {
					ids.push(places[i]._id);
				}
				placeChangeManager.find({place: {'$in': ids}}).populate('user', 'name').populate('place').exec(function(err, changes){
					res.send(JSON.stringify(changes));
				});
			}
			else {
				res.send(JSON.stringify(err));
			}
		});
	}
});



app.get('/ajax/religionGroups', function (req, res) {
	var query = extend({}, req.query);

	religionGroupManager.find(query, function(err, religionGroups){
		res.send(JSON.stringify(religionGroups));
	});
});


app.get('/ajax/denominations', function (req, res) {
	var query = req.query;

	denominationManager.find(query, function(err, denominations){
		res.send(JSON.stringify(denominations));
	});
});

app.get('/ajax/claims', function (req, res) {

	if (req.session.user && req.session.user.isAdmin) {
		claimManager.findAll(function (err, claims) {
			res.send(JSON.stringify(claims));
		});
	}
	else {
		res.end();
	}
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
			var mailText = 'User: ' + req.body.name +
											'\nEmail: ' + req.body.email +
											'\nTarget page: ' + req.body.target +
											'\nNote: ' + req.body.note;

			var mailOptions = {
				from: config.mailConfig.senderAddress,
				to: adminEmails.join(', '),
				subject: 'Feedback about OpenDoor',
				text: mailText
				//html: '<b>Hello world ✔</b>' // html body
			};

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
	if (!req.session.user) {
		return res.end();
	}
	var id = mongoose.Types.ObjectId();
	var isAdding = !req.params.id;
	var fields = {};
	var imagesPath = '/photos/';
	var files = {};

	var allowedFileFields = ['leaderPhoto', 'bannerPhoto'];
	var allowedFileExtensions = ['jpg', 'png'];

	function finishRequest(err, place) {

		if (isAdding){
			var userMail = req.session.user.email;
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
		else if (place.maintainer == req.session.user._id) {
			res.redirect('/message?message=placesaved');
		}
		else {
			res.redirect('/message?message=changesadded');
		}
	}

	function storePlace() {
		var place = extend({}, fields);
		place = extend(place, files);
		var locationAsString = fields.location.split(',');
		place.location = {
			type: 'Point',
			coordinates: [
					parseFloat(locationAsString[0])
				,	parseFloat(locationAsString[1])
			]};

		if (place.denominations && place.denominations.length) {
			place.denominations = place.denominations.split(',');
		}
		else {
			place.denominations = [];
		}

		if (place.mainMeetingTime) {
			place.mainMeetingTime = new Date(place.mainMeetingTime + ' 01.01.1970');
		}

		place.address = {
			line1: place.addressLine1
			,	line2: place.addressLine2
			,	city: place.city
			,	region: place.region
			,	country: place.country
			,	postalCode: place.postalCode
		};

		if (isAdding) {
			place._id = id;
			place.isConfirmed = false;
			place.maintainer = mongoose.Types.ObjectId(req.session.user._id);

			placeManager.add(place, finishRequest);
		}
		else {
			delete place.isConfirmed;
			placeManager.getById(req.params.id, function(err, currentPlace) {
				if (currentPlace) {
					console.log(currentPlace)
					if (currentPlace.maintainer && currentPlace.maintainer._id == req.session.user._id) {
						placeManager.update(req.params.id, place, finishRequest);
						console.log('upd');
					}
					else {
						for (var i in place) {
							if (place.hasOwnProperty(i)){
								if (JSON.stringify(currentPlace[i]) != JSON.stringify(place[i]) //stringify helps to compare arrays
									&& (place[i] || currentPlace[i])) { // there is no reason to change one empty value to another

									placeChangeManager.add({
										user: mongoose.Types.ObjectId(req.session.user._id)
										,	place: mongoose.Types.ObjectId(req.params.id)
										,	field: i
										,	value: place[i]
									}, function(err, change){
									});
								}
							}
						}
						console.log('propose');
						finishRequest(err, currentPlace);
					}
				}
				else {
					res.send("Object wasn't found");
				}
			});
		}

	}


	if (req.busboy) {
		req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			if (filename.length) {
				var extension = filename.toLowerCase().split('.').pop();
				if (allowedFileFields.indexOf(fieldname) != -1 && allowedFileExtensions.indexOf(extension) != -1) {
					var imgFileName = files[fieldname] = imagesPath + id + '_' + fieldname + '.' + extension;
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


app.post('/places/review/:id', function (req, res) {
	if (req.session.user) {
		var id = req.params.id;
		var data = {
			rating: req.body.rating
			,	text: req.body.text
			,	name: req.session.user.name
		};

		placeManager.addReview(id, data, function(err, place){
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



app.get('/claims/:id/accept', function (req, res) {
	if (req.session.user && req.session.user.isAdmin) {
		var id = req.params.id;
		claimManager.acceptClaim(id, function(err, place){
			if (!err && place) {
				res.redirect('/message?message=claimaccepted');
			}
			else {
				res.redirect('/error');
			}
		});
	}
});

app.get('/claims/:id/deny', function (req, res) {
	if (req.session.user && req.session.user.isAdmin) {
		var id = req.params.id;
		claimManager.removeClaim(id, function(err, place){
			if (!err && place) {
				res.redirect('/message?message=claimdenied');
			}
			else {
				res.redirect('/error');
			}
		});
	}
});


app.get('/placechanges/:id/accept', function (req, res) {
	if (req.session.user && req.session.user.isAdmin) {
		var id = req.params.id;
		placeChangeManager.acceptChange(id, function(err, place){
			if (!err && place) {
				res.redirect('/message?message=changeaccepted');
			}
			else {
				res.redirect('/error');
			}
		});
	}
});

app.get('/placechanges/:id/deny', function (req, res) {
	if (req.session.user && req.session.user.isAdmin) {
		var id = req.params.id;
		placeChangeManager.removeChange(id, function(err, place){
			if (!err && place) {
				res.redirect('/message?message=changedenied');
			}
			else {
				res.redirect('/error');
			}
		});
	}
});


app.post('/places/message', function (req, res) {
	var id = req.body.id;
	var data = {
		subject: req.body.subject
		,	text: req.body.text
	};

	if (req.session.user) {
		var senderEmail = req.session.user.email;
	}
	else {
		var senderEmail = req.body.email;
	}

	placeManager.findOne({_id: id}, function(err, place) {
		if (place && place.email) {
			var mailText = 'Sender: ' + senderEmail + '\n' +
					'Subject: ' + data.subject + '\n' +
					'Message: ' + data.text;
			var mailOptions = {
				from: config.mailConfig.senderAddress,
				to: place.email,
				subject: 'Message from OpenDoor.ooo',
				text: mailText
			};


			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					return console.log(error);
				}
				console.log('Message sent: ' + info.response);
				res.redirect('/message?message=messagesent');
			});
		}
	});
});



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