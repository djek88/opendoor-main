/**
 *
 *
 * Created by Vavooon on 17.12.2015.
 */


var sha1 = require('sha1');

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
			var User = mongoose.model('user', userSchema);
			var user = new User({
				name: data.name
				, email: data.email
				, password: sha1(data.password)
			});
			user.save(function (err, user) {
				console.log("User was saved successfully");
				if (typeof callback == 'function') {
					callback(err, user);
				}
			});
		};

		this.find = function(data, callback) {
			console.log(data);
			User.find({email: data.email, password: sha1(data.password)}, function(err, user){
				if (typeof callback == 'function') {
					callback(err, user);
				}
			});
		}
	}
	return UserManager;
};
