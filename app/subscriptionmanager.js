module.exports = function(mongoose) {
	var subscriptionSchema = new mongoose.Schema({
		name: String
		, email: String
		, place: {
			type: mongoose.Schema.Types.ObjectId
			,  ref: 'place'
		}
		, isConfirmed: {
				type: Boolean
			, default: false
		}
	}, {
		timestamps: true
	});

	var Subscription = mongoose.model('subscription', subscriptionSchema);

	function SubscriptionManager() {
		this.add = function(data, callback) {
			Subscription.findOne({email: data.email, place: data.place}, function(err, oldSubscription){
				console.log(arguments, data);
				if (!oldSubscription || data.isConfirmed == false) {
					if (oldSubscription) {
						oldSubscription.remove();
					}
					var subscription = new Subscription({
						name: data.name
						, email: data.email
						, place: data.place
						, isConfirmed: data.isConfirmed
					});
					subscription.save(function (err, subscription) {
						if (typeof callback == 'function') {
							callback(err, subscription);
						}
					});
				}
				else {
					if (typeof callback == 'function') {
						callback(new Error('exists'), oldSubscription);
					}
 				}
			})
		};

		this.markAsConfirmed = function(id, callback) {
			Subscription.findOneAndUpdate({'_id': id, isConfirmed: false}, {isConfirmed: true}, callback);
		};


		this.getAll = function(query, callback) {
			Subscription.find(query, callback);
		};

		this.find = function(query, cb) {
			Subscription.find(query, cb);
		};


	}
	return SubscriptionManager;
};

