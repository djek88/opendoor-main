module.exports = function(mongoose) {

	var placeNotificationSchema = new mongoose.Schema({
			email: String
		, location : {
				type: {
					type: String
						,	default: 'Point'
				}
			,	coordinates: [Number]
		}
		//,	range: Number
	});

	placeNotificationSchema.index({location: '2dsphere'});
	placeNotificationSchema.set('autoIndex', true);

	var PlaceNotification = mongoose.model('placenotification', placeNotificationSchema);

	function PlaceNotificationManager() {
		this.subscribe = function(data, callback) {
			var placeNotification = new PlaceNotification({
				name: data.name
				,	email: data.email
				, location: {
					coordinates: data.coordinates
				}
				//,	range: data.range
			});
			placeNotification.save(callback);
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
						,	"maxDistance": 10000
						,	"spherical": true
						,	"query": { "location.type": "Point" }
					}
				},
				{
					"$sort": {"distance": 1} // Sort the nearest first
				},
				{
					"$match": {}
				}
			];
			//if (data.religion) {
			//	options[2]['$match']['religion'] = data.religion;
			//}
			//if (data.maxDistance) {
			//	options[0]['$geoNear'].maxDistance = parseInt(data.maxDistance);
			//}
			PlaceNotification.aggregate(options, callback);
		};

		this.remove = PlaceNotification.remove.bind(PlaceNotification);
	}
	return PlaceNotificationManager;
};
