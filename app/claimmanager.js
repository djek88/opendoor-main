/**
 * Created by Vavooon on 18.12.2015.
 */


module.exports = function(mongoose) {
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
			Claim.find({}).populate('user', 'name').populate('place').exec(cb);
		};

		this.acceptClaim = function(id, callback) {
			Claim.findOne({_id: id}, function(err, claim){
				console.log('acc', claim)
				if (claim) {
					global.placeManager.setMaintainer(claim.place, claim.user, function(err, place){
						console.log(err)
						if (place) {
							claim.remove({}, callback);
						}
					});
				}
			})
		};

		this.removeClaim = function(id, callback) {
			Claim.findOneAndRemove({_id: id}, callback);
		}
	}
	return ClaimManager;
};

