/**
 * Created by Vavooon on 18.12.2015.
 */


module.exports = function(mongoose) {

	var placeSchema = new mongoose.Schema({
			name: String
		, denomination: String
		, postCode: String
		, address: String
		, email: String
		, addedByEmail: String
		, location: { type: [Number], index: '2dsphere' }
	});
	var Place = mongoose.model('place', placeSchema);
	placeSchema.index({location: '2dsphere'});

	function UserManager() {
		this.add = function(data, callback) {
			var place = new Place({
					name: data.name
				, lat: data.lat
				, lng: data.lng
			});
			place.save(function (err, user) {
				console.log("Place was saved successfully");
				if (typeof callback == 'function') {
					callback(err, user);
				}
			});
		};

		this.find = function(data, callback) {
			Place.aggregate([
				{
					"$geoNear": {
						"near": {
							"type": "Point",
							"coordinates": [
														parseFloat(data.lat)
													, parseFloat(data.lng)]
						},
						"distanceField": "distance",
						"maxDistance": 20000,
						"spherical": true,
						"query": { "location.type": "Point" }
					}
				},
				{
					"$sort": {"distance": 1} // Sort the nearest first
				}
			],
			function(err, places) {
				callback(err, places);
			});
		}
	}
	return UserManager;
};
