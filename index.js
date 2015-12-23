var config = require('./config.js');
var http = require('http');
var fs = require('fs');
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
var UserManager = require('./app/usermanager.js')(mongoose);
var userManager = new UserManager;
var PlaceManager = require('./app/placemanager.js')(mongoose);
var placeManager = new PlaceManager;
var sha1 = require('sha1');
var transporter = nodemailer.createTransport();
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
	console.log( req.session.id);
	delete req.session.id;
	delete req.session.email;
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


app.get('/ajax/places/search', function (req, res) {
	placeManager.find(req.query, function(err, places){
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


app.post('/feedback', function (req, res) {
	userManager.find({isAdmin: true}, function(err, users){
		if (err) {
			console.log(err);
		}
		else {
			console.log(users);
		}
	});
	//var mailOptions = {
	//	from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
	//	to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
	//	subject: 'Hello ✔', // Subject line
	//	text: 'Hello world ✔', // plaintext body
	//	html: '<b>Hello world ✔</b>' // html body
	//};
	//
	//// send mail with defined transport object
	//transporter.sendMail(mailOptions, function(error, info){
	//	if(error){
	//		return console.log(error);
	//	}
	//	console.log('Message sent: ' + info.response);
	//
	//});
	res.redirect('/message?message=feedbacksaved');
	res.end();
});

app.post('/places/add', function (req, res) {
	var fields = {};
	var imagesPath =__dirname + '/photos/';
	var fileExt;
	var tempFileName;
	var state = 0;

	function addPlace() {
		state++;
		if (state == 2) {
			var location = fields.location.split(',');
			var data = {
					name: fields.name
				, faith: fields.faith
				, postCode: fields.postCode
				, address: fields.address
				, email: fields.email
				, addedByEmail: req.session.email
				, photoExt: fileExt
				, location: location
			};

			placeManager.add(data, function (err, place) {
				if (!err) {
					//fs.writeFile(imagesPath + place._id + uploadedFileExt, fileContent, {encoding: 'ascii'}, function(){
					//	console.log(arguments);
					//});

					fs.rename(tempFileName, imagesPath + place._id + place.photoExt, function(err){
						res.redirect('/message?message=placeadded');
						res.end();
						console.log('renamed');
					});
				}
				else {
					console.log(err.stack);
					res.end();
				}
			});
		}
	}


	if (req.busboy) {
		req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			fileExt = '.' + filename.split('.').pop();
			tempFileName = imagesPath + Date.now() + fileExt;
			var fstream = fs.createWriteStream(tempFileName);
			file.pipe(fstream);
			fstream.on('close', addPlace);
			//file.on('data', function(data) {
			//	console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
			//});
			//file.on('end', function() {
			//	console.log('File [' + fieldname + '] Finished');
			//});
			file.resume();
		});
		req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
			fields[key] = value;
		});
		req.busboy.on('finish', addPlace);
	}
});

app.use(function(req, res) {
	if (req.xhr) {
		res.status(404).end();
	}
	else {
		jade.renderFile(__dirname + '/assets/templates/index.jade', function (err, content) {
			if (!err) {
				res.send(content);
			}
			else {
				console.log(err);
			}
		});
	}
});