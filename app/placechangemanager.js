module.exports = function(mongoose) {
	var fs = require('fs');
	var changeSchema = new mongoose.Schema({
		user: {
			type: mongoose.Schema.Types.ObjectId
			, ref: 'user'
		}
		,	place: {
			type: mongoose.Schema.Types.ObjectId
			, ref: 'place'
		}
		, field: String
		, value: mongoose.Schema.Types.Mixed
	});

	var PlaceChange = mongoose.model('change', changeSchema);

	function PlaceChangeManager() {

		this.add = function(data, callback) {
			var change = new PlaceChange(data);
			change.save(callback);
		};

		this.find = PlaceChange.find.bind(PlaceChange);
		this.findOne = PlaceChange.findOne.bind(PlaceChange);

		this.findAll = function(cb) {
			PlaceChange.find({}).populate('user', 'name').populate('place').exec(cb);
		};

		this.acceptChange = function(id, callback) {
			PlaceChange.findOne({_id: id}, function(err, change){
				if (change) {
					global.placeManager.findOne(change.place, function(err, place){
						console.log(1, change);
						if (place[change.field] && (change.field == 'bannerPhoto' || change.field == 'leaderPhoto')) {
							fs.unlink(global.appDir + global.imagesPath + place[change.field]);
						}
						place[change.field] = change.value;
						global.placeManager.update(change.place, place, function(err, place){
							console.log(arguments);
						});
						change.remove({}, callback);
					});
				}
				else {
					if (typeof callback == 'function') {
						callback(err, change);
					}
				}
			})
		};

		this.removeChange = function(id, callback) {
			PlaceChange.findOne({_id: id}, function(err, change) {
				if (change) {
					if (change.field == 'bannerPhoto' || change.field == 'leaderPhoto') {
						console.log(2, change);
						fs.unlink(global.appDir + global.imagesPath + change.value);
					}
					change.remove({}, callback);
				}
				else {
					if (typeof callback == 'function') {
						callback(err, change);
					}
				}
			});
		}
	}
	return PlaceChangeManager;
};

