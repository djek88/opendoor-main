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
		, maintainerName: String
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
	};

	var placeSchema = new mongoose.Schema(placeFields, {
		timestamps: true
	});
	placeSchema.index({location: '2dsphere'});
	placeSchema.set('autoIndex', true);

	var Place = mongoose.model('place', placeSchema);
	var Review = mongoose.model('review', reviewSchema);

	function PlaceManager() {
		this.fields = placeFields;

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


			place.save(callback);
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
			Place.findOneAndUpdate({_id: id}, place, callback);
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
			if (data.religion && data.religion != '*') {
				options[2]['$match']['religion'] = data.religion;
			}
			Place.aggregate(options, callback);
		};

		this.getById = function(id, callback) {
			Place.findOne({'_id': mongoose.Types.ObjectId(id)}, callback);
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
				console.log(place.reviews);
				if (typeof callback=='function') {
					callback(err, place);
				}
			});


				//{$push: {reviews: data}}, callback);
		}


		this.find = function(options, callback) {
			Place.find(options, callback);
		};

		this.findOne = function(options, callback) {
			Place.findOne(options, callback);
		};


	}
	return PlaceManager;
};
