module.exports = function(subscriptionManager, placeManager, email){
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

		placeManager.findOne({_id: data.place}, function(err, place) {
			if (place) {
				subscriptionManager.add(data, function(err, subscription) {
					if (!err && subscription) {
						if (subscription.isConfirmed) {
							res.redirect('/message?message=subscriptionadded&back=' + encodeURIComponent('/places/' + place.uri))
						}
						else {
							var options = {
								id: subscription._id
								, recipientEmail: data.email
							};

							email.sendSubscriptionConfirmation(options, function(){
								console.log(arguments);
								res.redirect('/message?message=verifysubscription&back=' + encodeURIComponent('/places/' + place.uri))
							});
						}
					}
					else if (err && err.message == 'exists') {
						res.redirect('/error?message=subscriptionexists&back=' + encodeURIComponent('/places/' + place.uri))
					}
					else {
						res.redirect('/error&back=' + encodeURIComponent('/places/' + place.uri));
					}
				});
			}
			else {
				res.redirect('/error');
			}

		});

	};
};