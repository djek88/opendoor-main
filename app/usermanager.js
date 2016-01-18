/**
 *
 *
 * Created by Vavooon on 17.12.2015.
 */


module.exports = function(mongoose) {

	var userSchema = new mongoose.Schema({
		name: String,
		email: String,
		password: String,
		isAdmin: Boolean
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

		this.findOne = function(options, callback) {
			User.findOne(options, callback);
		};
	}
	return UserManager;
};
