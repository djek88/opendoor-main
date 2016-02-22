/**
 * Created by Vavooon on 18.12.2015.
 */

module.exports = function(mongoose, email, config) {


	var sanitizeHtml = require('sanitize-html');

	var promotionSchema = new mongoose.Schema({
			name: String
		,	expireDate: Date
		, url: String
	});

	var reviewSchema = new mongoose.Schema({
			name: String
		,	rating: {
				type: Number
			,	required: true
			}
		,	text: String
	});

	var eventSchema = new mongoose.Schema({
		name: String
		,	date: Date
		,	description: String
		,	address: String
		, location : {
				type: {
					type: String
					,	default: 'Point'
				}
				,	coordinates: [Number]
			}
	});

	var jobSchema = new mongoose.Schema({
		title: String,
		type: String,
		description: String,
		email: String,
		expireDate: Date
	});

	var placeSchema = new mongoose.Schema({
			name: {
				type: String
				,	required: true
			}
			, uri: {
				type: String
				,	required: true
			}
			, religion: {
				type: String
				,	required: true
			}
			, groupName: {
				type: String
				,	required: true
			}
			, address: {
					line1: String
				,	line2: String
				, locality: {
					type: String
					,	required: true
				}
				,	region: String
				,	country: {
					type: String
					,	required: true
				}
				,	postalCode: String
			}
			, concatenatedAddress: String
			, location : {
				type: {
					type: String
					,	default: 'Point'
				}
				,	coordinates: [Number]
			}
			, denominations: [String]
			, leaderName: String
			, leaderRole: String
			, phone: String
			, homepage: String
			, email: String
			, mainMeetingDay: String
			, mainMeetingTime: Date
			, bannerPhoto: String
			, leaderPhoto: String
			, about: String
			, travelInformation: String
			, addedByEmail: String
			, maintainer: {
				type: mongoose.Schema.Types.ObjectId
				, ref: 'user'
			}
			, isConfirmed: Boolean
			, reviews: {
				type: [reviewSchema]
				,	default: []
			}
			, events: {
				type: [eventSchema]
				, default: []
			}
			, promotions: {
				type: [promotionSchema]
				, default: []
			}
			, jobs: {
				type: [jobSchema]
				, default: []
			}
			,	averageRating: {
				type: Number
				,	default: 1
			}
			,	ratingsCount: {
				type: Number
				,	default: 0
			}
			,	jsonLd: mongoose.Schema.Types.Mixed
		}
		, {
		timestamps: true
	});
	placeSchema.index({location: '2dsphere'});
	placeSchema.set('autoIndex', true);

	var Place = mongoose.model('place', placeSchema);

	function preprocessFields(place, callback) {
		var religionGroup = {name: place.groupName, religion: place.religion};
		religionGroupManager.find(religionGroup, function(err, religionGroups){
			if (!err && !religionGroups.length) {
				global.religionGroupManager.add(religionGroup);
			}
		});

		global.denominationManager.addIfNotExists(place.denominations, place.religion);
		place.uri = [place.address.country, place.address.region, place.address.locality, place.religion, place.groupName, place.name].join('/').replace(/_/g, '').replace(/[^a-zA-Z0-9/\s]/g, '').replace(/\s+/g, '-');
		place.concatenatedAddress = [place.address.line1, place.address.line2, place.address.locality, place.address.region, place.address.country, place.address.postalCode].cleanArray().join(', ');
		place.about = sanitizeHtml(place.about);
		place.travelInformation = sanitizeHtml(place.travelInformation);
		Place.find({'$and':[{uri: place.uri}, {_id: {'$ne': mongoose.Types.ObjectId(place._id)}}]}, function(err, places){
			if (places.length) {
				err = new Error('Place with such URI already exists');
			}
			if (typeof callback=='function') {
				callback(err, place);
			}
		});
	}

	function createJsonLd(place) {
		var data = {
				'@type': 'Place'
			,	name: place.name
			,	mainentitiyofpage: config.url + '/' + place.uri
			,	geo: {
				'@type': 'GeoCoordinates'
				, latitude: place.location.coordinates[1]
				, longitude: place.location.coordinates[0]
			}
			,	address: {
				'@type': 'PostalAddress'
				,	addressCountry: place.address.country
				,	addressLocality: place.address.locality
				,	addressRegion: place.address.region
				,	postalCode: place.address.postalCode
				,	streetAddress: [place.address.line1, place.address.line2].cleanArray().join(', ')
			}
		};


		if (place.bannerPhoto) {
			data.image = config.url + '/photos/' + place.bannerPhoto;
		}

		if (place.about) {
			data.description = place.about;
		}

		if (place.phone) {
			data.telephone = place.phone;
		}

		if (place.averageRating) {
			data.aggregateRating = place.averageRating;
		}

		if (place.reviews.length) {
			data.review = [];
			for (var i=0; i < place.reviews.length; i++) {
				data.review.push({
					"@type": 'Review'
					,	author: place.reviews[i].name
					,	reviewBody: place.reviews[i].text
					,	reviewRating: {
						"@type": 'Rating'
						,	ratingValue: place.reviews[i].rating
					}
				})
			}
		}
		return data;
	}

	function PlaceManager() {
		this.model = Place;

		this.add = function(data, callback) {
			var place = new Place(data);
			place.jsonLd = createJsonLd(place);
			preprocessFields(place, function(err){
				if (!err) {
					place.save(callback);
				}
				else {
					if (typeof callback=='function') {
						callback(err, place);
					}
				}
			});

		};

		this.update = function(id, data, callback) {
			Place.findOne({_id: id}, function(err, place) {
				for (var i in data) {
					place[i] = data[i];
				}
				preprocessFields(place, function(err){
					if (!err) {
						place.jsonLd = createJsonLd(place);
						place.save(callback);
					}
					else {
						if (typeof callback=='function') {
							callback(err);
						}
					}
				});
			})


		};

		this.setMaintainer = function(id, maintainerId, callback) {
			Place.findOne({_id: id}, function(err, place) {
				console.log('place.findone', arguments);
				if (place.maintainer) {
					global.userManager.findOne({_id: place.maintainer}, function(err, user){
						if (user) {
							var index = user.maintainedPlaces.indexOf(place._id);
							if (index != -1) {
								user.maintainedPlaces.splice(index, 1);
								user.save();
							}
						}
					})
				}
				place.maintainer = maintainerId;
				global.userManager.findOne({_id: maintainerId}, function(err, user){
					if (user) {
						user.maintainedPlaces.push(place._id);
						user.save();
					}
				});
				place.maintainer = maintainerId;
				place.save(callback);
			});
				//{'$set': {maintainer: mongoose.Types.ObjectId(maintainerId)}}
			//}, callback);
		};

		this.findNearby = function(data, callback) {
			var skipPosition;
			var limitPosition;
			var geoNearOption = {
				"near": {
					"type": "Point"
					,	"coordinates": data.coordinates
				}
				,	"distanceField": "distance"
				//,	"maxDistance": 2000
				,	"spherical": true
				,	"query": { "location.type": "Point" }
			};
			var matchOption = {
				'isConfirmed': true
			};

			var options = [
				{
					"$match": matchOption
				}
			];
			if (data.coordinates) {
				options.unshift({"$geoNear": geoNearOption}, {
					"$sort": {"distance": 1} // Show the nearest first
				});
			}

			if (data.religion) {
				matchOption['religion'] = data.religion;
			}

			if (data.name) {
				matchOption['name'] = new RegExp(data.name, 'i');
			}
			if (data.maxDistance) {
				geoNearOption.maxDistance = parseInt(data.maxDistance);
			}
			if (data.skip) {
				skipPosition = options.push({"$skip": parseInt(data.skip)});
			}
			if (data.limit) {
				var limit = parseInt(data.limit);
				limit = limit > config.frontend.maxItemsPerPage ? config.frontend.maxItemsPerPage : limit;
				limitPosition = options.push({"$limit": limit});
			}
			else {
				limitPosition = options.push({"$limit": config.frontend.itemsPerPage});
			}
			if (data.exclude) {
				geoNearOption['query']['_id'] = {'$ne': mongoose.Types.ObjectId(data.exclude)};
			}

			if (data.maintained) {
				matchOption['maintainer'] = {$ne: null};
			}

			Place.aggregate(options, function(err, places){
				options.push({ $group: { _id: null, count: { $sum: 1 } } });


				if (limitPosition) {
					options.splice(limitPosition - 1, 1);
				}
				if (skipPosition) {
					options.splice(skipPosition - 1, 1);
				}
				Place.aggregate(options, function(err, stats){
					Place.populate(places, {path: "maintainer"}, function(err, places){
						var response = {
							results: places
							, count: stats[0] ? stats[0].count : 0
						};
						if (typeof callback == 'function') {
							callback(err, response);
						}
					});
				});
			});
		};

		this.getById = function(id, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}).populate('maintainer', 'name').exec(callback);
		};


		this.markAsConfirmed = function(id, callback) {
			Place.findOneAndUpdate({'_id': id, isConfirmed: false}, {isConfirmed: true}, function(err, place){
				if (place) {
					var data = {
							coordinates: place.location.coordinates
						,	religion: place.religion
						,	id: place.uri
					};
					global.placeNotificationManager.findNearby(data, function(err, placeNotifications){
						var ids = [];
						for (var i = 0; i < placeNotifications.length; i++) {
							email.sendNotificationAboutNewPlace(data.id, placeNotifications[i].email);
							ids.push(mongoose.Types.ObjectId(placeNotifications[i]._id));
						}
						global.placeNotificationManager.remove({_id:{'$in': ids}}, function(){});
					});
				}
				if (typeof callback == 'function') {
					callback(err, place);
				}
			});
		};

		this.addReview = function(id, data, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}, function(err, place) {
				if (!err && place) {
					place.reviews.push(data);
					var averageRating = 0;
					for (var i=0; i < place.reviews.length; i++) {
						averageRating += place.reviews[i].rating;
					}
					place.ratingsCount = place.reviews.length;
					place.averageRating = averageRating / place.reviews.length;
					place.jsonLd = createJsonLd(place);
					place.save(callback);
				}
				else {
					if (typeof callback=='function') {
						callback(err, place);
					}
				}
			});
		};


		this.addEvent = function(id, data, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}, function(err, place) {
				if (!err && place) {
					place.events.push(data);
					place.events.sort(function(a,b){
						return a.date > b.date ? 1 : -1;
					});
					place.save(callback);
				}
				else {
					if (typeof callback=='function') {
						callback(err, place);
					}
				}
			});
		};

		this.addPromotion = function(id, data, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}, function(err, place) {
				if (!err && place) {
					place.promotions.push(data);
					place.promotions.sort(function(a,b){
						return a.expireDate > b.expireDate ? 1 : -1;
					});
					place.save(callback);
				}
				else {
					if (typeof callback=='function') {
						callback(err, place);
					}
				}
			});
		};

		this.addJob = function(id, data, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}, function(err, place) {
				if (!err && place) {
					var job = place.jobs.create(data);
					place.jobs.push(job);
					place.jobs.sort(function(a,b){
						return a.expireDate > b.expireDate ? 1 : -1;
					});
					place.save(function(err, place){

						if (typeof callback=='function') {
							callback(err, job);
						}
					});
				}
				else {
					if (typeof callback=='function') {
						callback(err, place);
					}
				}
			});
		};


		this.find = Place.find.bind(Place);
		this.findOne = Place.findOne.bind(Place);
		this.findById = Place.findById.bind(Place);
		this.findOneAndUpdate = Place.findOneAndUpdate.bind(Place);
		this.aggregate = Place.aggregate.bind(Place);


	}
	return PlaceManager;
};
