module.exports = function(mongoose) {
	var religionGroupSchema = new mongoose.Schema({
				name: String
			, religion: String
		});

	var ReligionGroup = mongoose.model('religionGroup', religionGroupSchema);

	function ReligionGroupManager() {
		this.add = function(data, callback) {
			var religionGroup = new ReligionGroup({
					name: data.name
				, religion: data.religion
			});
			religionGroup.save(function (err, religionGroup) {
				if (typeof callback == 'function') {
					callback(err, religionGroup);
				}
			});
		};


		this.find = function(query, cb) {
			ReligionGroup.find(query, cb);
		};

	}
	return ReligionGroupManager;
};

