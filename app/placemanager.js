/**
 * Created by Vavooon on 18.12.2015.
 */


module.exports = function(mongoose) {

	var reviewSchema = new mongoose.Schema({
			email: String
		,	rating: Number
		,	text: String
	});

	var placeSchema = new mongoose.Schema({
			name: String
		, faith: String
		, pastorName: String
		, phone: String
		, postalCode: String
		, address: String
		, email: String
		, addedByEmail: String
		, photoExt: String
		, location : {
			type: {
					type: String
				,	default: 'Point'
			},
			coordinates: [Number]
		}
			, isConfirmed: {
				type: Boolean
				,	default: false
			}
		, openingTime: Date
		, closingTime: Date
		, reviews: {
			type: [reviewSchema]
			,	default: []
		}
	}
	, {
			timestamps: true
		});
	placeSchema.index({location: '2dsphere'});
	placeSchema.set('autoIndex', true);

	var Place = mongoose.model('place', placeSchema);

	function PlaceManager() {
		this.add = function(data, callback) {
			var place = new Place({
					name: data.name
				, faith: data.faith
				, pastorName: data.pastorName
				, phone: data.phone
				, postalCode: data.postalCode
				, address: data.address
				, email: data.email
				, addedByEmail: data.addedByEmail
				, photoExt: data.photoExt
				, location : {
							type : "Point"
						,	coordinates : data.location
					}
				, openingTime: data.openingTime ? new Date(data.openingTime + ' 01.01.1970') : null
				, closingTime: data.closingTime ? new Date(data.closingTime + ' 01.01.1970') : null
			});
			place.save(function (err, place) {
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
			if (data.faiths && data.faiths != '*') {
				options[2]['$match']['faith'] = data.faiths;
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
		}

		this.markAsConfirmed = function(id, callback) {
			Place.findOneAndUpdate({'_id': id, isConfirmed: false}, {isConfirmed: true},
				function(err, places) {
					callback(err, places);
				});
		}


	}
	return PlaceManager;
};
