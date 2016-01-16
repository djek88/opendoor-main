/**
 * Created by Vavooon on 18.12.2015.
 */
var AbstractManager = require('./abstractmanager.js');

module.exports = function(mongoose) {


	var reviewSchema = new mongoose.Schema({
			email: String
		,	rating: Number
		,	text: String
	});

	var placeFields = {
		name: {
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
					type: String
				,	required: true
			}
		, location : {
				//required: true
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
		, url: String
		, email: String
		, mainMeetingDay: String
		, mainMeetingTime: Date
		, bannerPhoto: String
		, leaderPhoto: String
		, about: String
		, travelInformation: String
		, addedByEmail: String
		, isConfirmed: {
			type: Boolean
			,	default: false
		}
		, reviews: {
			type: [reviewSchema]
			,	default: []
		}
	};

	var placeSchema = new mongoose.Schema(placeFields, {
		timestamps: true
	});
	placeSchema.index({location: '2dsphere'});
	placeSchema.set('autoIndex', true);

	var Place = mongoose.model('place', placeSchema);

	function PlaceManager() {
		this.fields = placeFields;
		AbstractManager.apply(this, arguments);

		this.add = function(data, callback) {
			var place = new Place(data);

			var religionGroup = {name: place.groupName, religion: place.religion};
			religionGroupManager.find(religionGroup, function(err, religionGroups){
				if (!err && !religionGroups.length) {
					global.religionGroupManager.add(religionGroup);
					console.log('add religionGroup', religionGroup);
				}
			});

			global.denominationManager.addIfNotExists(place.denominations, place.religion);


			place.save(function (err, place) {
				if (typeof callback == 'function') {
					callback(err, place);
				}
			});
		};

		this.update = function(id, data, callback) {
			var place = (new Place(data)).toObject();
			delete place._id;
			var religionGroup = {name: place.groupName, religion: place.religion};
			religionGroupManager.find(religionGroup, function(err, religionGroups){
				if (!err && !religionGroups.length) {
					global.religionGroupManager.add(religionGroup);
					console.log('add religionGroup', religionGroup);
				}
			});

			global.denominationManager.addIfNotExists(place.denominations, place.religion);

			console.log('findOneAndUpdate', {_id: id}, place)
			Place.findOneAndUpdate({_id: id}, place, function(err, place){
				if (typeof callback == 'function') {
					callback(err, place);
				}
			});
		};

		this.findNearby = function(data, callback) {
			var options = [
				{
					"$geoNear": {
						"near": {
							"type": "Point"
							,	"coordinates": [
								parseFloat(data.lat)
								, parseFloat(data.lng)]
						}
						,	"distanceField": "distance"
						,	"maxDistance": 2000
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
			if (data.religions && data.religions != '*') {
				options[2]['$match']['religion'] = data.religions;
			}
			Place.aggregate(options,
			function(err, places) {
				callback(err, places);
			});
		};

		this.getById = function(id, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)},
				function(err, places) {
					callback(err, places);
				});
		};

		this.markAsConfirmed = function(id, callback) {
			Place.findOneAndUpdate({'_id': id, isConfirmed: false}, {isConfirmed: true},
				function(err, places) {
					callback(err, places);
				});
		}

		this.addReview = function(id, data, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)},
				function(err, place) {
					console.log(place);
				});
		}


	}
	return PlaceManager;
};
