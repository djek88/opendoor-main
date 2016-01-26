module.exports = function(mongoose, userManager, placeChangeManager, placeNotificationManager, email) {
	var fs = require('fs');
	var extend = require('util')._extend;
	return function (req, res) {
		if (!req.session.user) {
			return res.end();
		}
		var isAdding = !req.params.id;
		if (isAdding) {
			var id = mongoose.Types.ObjectId();
		}
		else {
			var id = mongoose.Types.ObjectId(req.params.id);
		}
		var fields = {};

		var files = {};

		var allowedFileFields = ['leaderPhoto', 'bannerPhoto'];
		var allowedFileExtensions = ['jpg', 'png'];

		function finishRequest(err, place) {
			if (isAdding) {
				email.sendNotificationAboutNewPlaceToAdmin(id);
				email.sendConfirmationLink(id, req.session.user.email);
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
			delete fields.isConfirmed;
			delete fields.maintainer;
			var place = extend({}, fields);
			place = extend(place, files);
			var locationAsString = fields.location.split(',');
			place.location = {
				type: 'Point',
				coordinates: [
					parseFloat(locationAsString[0])
					, parseFloat(locationAsString[1])
				]
			};

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
				, line2: place.addressLine2
				, city: place.city
				, region: place.region
				, country: place.country
				, postalCode: place.postalCode
			};

			delete place.addressLine1;
			delete place.addressLine2;
			delete place.city;
			delete place.region;
			delete place.country;
			delete place.postalCode;

			if (isAdding) {
				place._id = id;
				place.isConfirmed = false;
				place.maintainer = mongoose.Types.ObjectId(req.session.user._id);

				placeManager.add(place, finishRequest);
			}
			else {
				placeManager.getById(req.params.id, function (err, currentPlace) {
					if (currentPlace) {
						if (currentPlace.maintainer && currentPlace.maintainer._id == req.session.user._id) {
							placeManager.update(req.params.id, place, finishRequest);
						}
						else {
							for (var i in place) {
								if (place.hasOwnProperty(i)) {
									if (JSON.stringify(currentPlace[i]) != JSON.stringify(place[i]) //stringify helps to compare arrays
										&& (place[i] || currentPlace[i])) { // there is no reason to change one empty value to another

										placeChangeManager.add({
											user: mongoose.Types.ObjectId(req.session.user._id)
											, place: mongoose.Types.ObjectId(req.params.id)
											, field: i
											, value: place[i]
										}, function (err, change) {
										});
									}
								}
							}
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
			req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
				if (filename.length) {
					var extension = filename.toLowerCase().split('.').pop();
					if (allowedFileFields.indexOf(fieldname) != -1 && allowedFileExtensions.indexOf(extension) != -1) {
						var imgFileName = files[fieldname] = id + '_' + fieldname + '_' + global.getUniqueFilename() + '.' + extension;
						var fstream = fs.createWriteStream(global.appDir + global.imagesPath + imgFileName);
						file.pipe(fstream);
					}
					else {
						console.warn('wrong extendion or field name:', fieldname, extension);
					}
				}
				file.resume();
			});
			req.busboy.on('field', function (key, value) {
				fields[key] = value;
			});
			req.busboy.on('finish', storePlace);
		}
		else {
			res.end();
		}
	}
};