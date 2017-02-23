module.exports = function(mongoose, config) {

	var userSchema = new mongoose.Schema({
		name: String,
		email: String,
		password: String,
		isAdmin: Boolean,
		maintainedPlaces: {
			type: [mongoose.Schema.Types.ObjectId]
		, ref: 'place'
		}
	});
	var User = mongoose.model('user', userSchema);

	function UserManager() {
		this.register = function(data, callback) {
			this.find({email: data.email}, function(err, users) {
				if (!err) {
					if (!users.length) {
						var user = new User({
								name: data.name
							,	email: data.email
							, password: data.password
						});
						user.save(function (err, user) {
							console.log("User was saved successfully");
							if (typeof callback == 'function') {
								callback(err, user);
							}
						});
					}
					else {
						var e = new Error("alreadyregistered");
						callback(e, users);
					}
				}
				else {
					callback(err, users);
				}
			});
		};

		this.find = function(options, callback) {
			User.find(options, callback);
		};

		this.search = function(data, callback) {
			var skipPosition;
			var limitPosition;
			var matchOption = {
			};

			var options = [
				{
					"$match": matchOption
				}
			];

			if (data.maintainers == 'true') {
				matchOption['maintainedPlaces'] =  { $exists: true, $ne: [] };
			}

			if (data.email) {
				matchOption['email'] = new RegExp(data.email, 'i');
			}
			if (data.name) {
				matchOption['name'] = new RegExp(data.name, 'i');
			}

			if (data.skip) {
				skipPosition = options.push({"$skip": parseInt(data.skip)});
			}
			if (data.limit) {
				var limit = parseInt(data.limit);
				limit = limit > config.frontend.maxItemsPerPage ? config.frontend.maxItemsPerPage : limit;
				limitPosition = options.push({"$limit": limit});
			}
			else {
				limitPosition = options.push({"$limit": config.frontend.itemsPerPage});
			}

			User.aggregate(options, function(err, users){
				options.push({ $group: { _id: null, count: { $sum: 1 } } });

				if (limitPosition) {
					options.splice(limitPosition - 1, 1);
				}
				if (skipPosition) {
					options.splice(skipPosition - 1, 1);
				}
				User.aggregate(options, function(err, stats){
					//Place.populate(places, {path: "maintainer"}, function(err, places){
						var response = {
							results: users
							, count: stats[0] ? stats[0].count : 0
						};
						if (typeof callback == 'function') {
							callback(err, response);
						}
					//});
				});
			});
		};

		this.findOne = function(options, callback) {
			User.findOne(options, callback);
		};
		this.findById = User.findById.bind(User);
	}
	return UserManager;
};
