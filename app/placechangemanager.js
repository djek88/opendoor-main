module.exports = function(mongoose) {
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

		this.findAll = function(cb) {
			PlaceChange.find({}).populate('user', 'name').populate('place').exec(cb);
		};

		this.acceptChange = function(id, callback) {
			PlaceChange.findOne({_id: id}, function(err, change){
				if (change) {
					global.placeManager.findOne(change.place, function(err, place){
						place[change.field] = change.value;
						place.save();
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
			PlaceChange.findOneAndRemove({_id: id}, callback);
		}
	}
	return PlaceChangeManager;
};

