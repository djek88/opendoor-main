module.exports = function(subscriptionManager, email){
	return function (req, res) {
		var id = req.params.id;

		subscriptionManager.markAsConfirmed(id, function(err, subscription) {
			console.log(arguments);
			if (!err && subscription) {
				res.redirect('/message?message=subscriptionconfirmed');
			}
			else {
				res.redirect('/error?message=subscriptionconfirmationerror');
			}
		});
	};
};