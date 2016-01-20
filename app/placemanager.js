/**
 * Created by Vavooon on 18.12.2015.
 */

module.exports = function(mongoose) {


	var reviewSchema = new mongoose.Schema({
			name: String
		,	rating: {
				type: Number
			,	required: true
			}
		,	text: String
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
					line1: {
						type: String
						,	required: true
					}
				,	line2: String
				, city: {
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
			, isConfirmed: {
				type: Boolean
				,	default: false
			}
			, reviews: {
				type: [reviewSchema]
				,	default: []
			}
			,	averageRating: {
				type: Number
				,	default: 0
			}
			,	ratingsCount: {
				type: Number
				,	default: 0
			}
		}
		, {
		timestamps: true
	});
	//placeSchema.index({location: '2dsphere'});
	placeSchema.index({location: '2dsphere'});
	placeSchema.set('autoIndex', true);

	var Place = mongoose.model('place', placeSchema);

	function preprocessFields(place) {

		var religionGroup = {name: place.groupName, religion: place.religion};
		religionGroupManager.find(religionGroup, function(err, religionGroups){
			if (!err && !religionGroups.length) {
				global.religionGroupManager.add(religionGroup);
			}
		});

		global.denominationManager.addIfNotExists(place.denominations, place.religion);
		place.uri = [place.address.country, place.address.region, place.address.city, place.religion, place.groupName, place.name].join('/');
		place.concatenatedAddress = [place.address.line1, place.address.line2, place.address.city, place.address.region, place.address.country, place.address.postalCode].cleanArray().join(', ');
	}

	function PlaceManager() {
		this.model = Place;

		this.add = function(data, callback) {
			var place = new Place(data);

			preprocessFields(place);


			place.save(callback);
		};

		this.update = function(id, data, callback) {
			var place = (new Place(data)).toObject();
			delete place._id;

			preprocessFields(place);

			Place.findOneAndUpdate({_id: id}, {'$set': place}, callback);
		};

		this.setMaintainer = function(id, maintainerId, callback) {
			Place.findOneAndUpdate({_id: id}, {'$set': {maintainer: mongoose.Types.ObjectId(maintainerId)}}, callback);
		};

		this.findNearby = function(data, callback) {
			var options = [
				{
					"$geoNear": {
						"near": {
							"type": "Point"
							,	"coordinates": data.coordinates
						}
						,	"distanceField": "distance"
						//,	"maxDistance": 2000
						,	"spherical": true
						,	"query": { "location.type": "Point" }
					}
				},
				{
					"$sort": {"distance": 1} // Sort the nearest first
				},
				{
					"$match": {
						'isConfirmed': true
					}
				}
			];
			if (data.religion) {
				options[2]['$match']['religion'] = data.religion;
			}
			if (data.maxDistance) {
				options[0]['$geoNear'].maxDistance = parseInt(data.maxDistance);
			}
			Place.aggregate(options, function(err, places){
				Place.populate(places, {path: "maintainer"}, callback);
			});
		};

		this.getById = function(id, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}).populate('maintainer', 'name').exec(callback);
	};

		this.markAsConfirmed = function(id, callback) {
			Place.findOneAndUpdate({'_id': id, isConfirmed: false}, {isConfirmed: true}, callback);
		};

		this.addReview = function(id, data, callback) {
			console.log(data);
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}, function(err, place) {
				place.reviews.push(data);
				var averageRating = 0;
				for (var i=0; i < place.reviews.length; i++) {
					averageRating += place.reviews[i].rating;
				}
				place.ratingsCount = place.reviews.length;
				place.averageRating = averageRating / place.reviews.length;
				place.save();
				if (typeof callback=='function') {
					callback(err, place);
				}
			});
		};



		this.find = function(options, callback) {
			Place.find(options, callback);
		};

		this.find = Place.find.bind(Place);

		this.findOne = function(options, callback) {
			Place.findOne(options, callback);
		};


	}
	return PlaceManager;
};
