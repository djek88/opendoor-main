/**
 * Created by Vavooon on 18.12.2015.
 */


module.exports = function(mongoose, email) {
	var claimSchema = new mongoose.Schema({
			user: {
				type: mongoose.Schema.Types.ObjectId
			, ref: 'user'
			}
		,	place: {
				type: mongoose.Schema.Types.ObjectId
			, ref: 'place'
			}
	});

	var Claim = mongoose.model('claim', claimSchema);

	function ClaimManager() {
		var self = this;

		this.add = function(data, callback) {
			var claim = new Claim(data);
			claim.save(callback);
		};

		this.find = function(query, cb) {
			Claim.find(query, cb);
		};

		this.findAll = function(cb) {
			Claim.find({}).populate('user').populate('place').exec(cb);
		};

		this.acceptClaim = function(id, callback) {
			console.log('acceptClaim');
			Claim.findOne({_id: id}, function(err, claim){
				console.log(claim);
				if (claim) {
					global.placeManager.setMaintainer(claim.place, claim.user, function(err, place){
						console.log('setMaintainer', arguments);
						if (place) {
							global.userManager.findOne(claim.user, function(err, user){
								console.log('findOne', arguments);
								email.sendClaimConfirmation({id: claim.place, recipientEmail: user.email});
							});
							claim.remove({}, callback);
						}
						else {
							if (typeof callback == 'function') {
								callback(err, claim);
							}
						}
					});
				}
				else {
					if (typeof callback == 'function') {
						callback(err, claim);
					}
				}
			})
		};

		this.removeClaim = function(id, callback) {
			Claim.findOneAndRemove({_id: id}, callback);
		}
	}
	return ClaimManager;
};

