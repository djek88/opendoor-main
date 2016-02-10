module.exports = function(subscriptionManager, email){
	return function (req, res) {
		var id = req.body.id;
		var data = {
			place: req.body.place
		};

		if (req.session.user) {
			data.name = req.session.user.name;
			data.email = req.session.user.email;
			data.isConfirmed = true;
		}
		else {
			data.name = req.body.name;
			data.email = req.body.email;
			data.isConfirmed = false;
		}

		subscriptionManager.add(data, function(err, subscription) {
			console.log(JSON.stringify(err));
			if (!err && subscription) {
				if (subscription.isConfirmed) {
					res.redirect('/message?message=subscriptionadded')
				}
				else {
					var options = {
						id: subscription._id
						, recipientEmail: data.email
					};

					email.sendSubscriptionConfirmation(options, function(){
						console.log(arguments);
						res.redirect('/message?message=verifysubscription')
					});
				}
			}
			else if (err && err.message == 'exists') {
				res.redirect('/error?message=subscriptionexists')
			}
			else {
				res.redirect('/error')
			}
		});
	};
};