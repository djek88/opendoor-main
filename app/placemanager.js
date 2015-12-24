/**
 * Created by Vavooon on 18.12.2015.
 */


module.exports = function(mongoose) {

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
			});
			place.save(function (err, place) {
				if (typeof callback == 'function') {
					callback(err, place);
				}
			});
		};

		this.find = function(data, callback) {
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
						,	"maxDistance": 20000
						,	"spherical": true
						,	"query": { "location.type": "Point" }
					}
				},
				{
					"$sort": {"distance": 1} // Sort the nearest first
				}
			];
			if (data.faiths && data.faiths != '*') {
				options.push( {"$match": {'faith': data.faiths}});
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
	}
	return PlaceManager;
};
