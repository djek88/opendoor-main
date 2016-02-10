module.exports = function(placeManager, stripe){
	return function (req, res) {
		var data = req.body;
		var id = req.params.id;
		var sum = parseFloat(req.body.sum);
		stripe.charges.create({
			amount: sum * 100, // amount in cents, again
			currency: "usd",
			source: data.token,
			description: "Place promotion"
		}, function(err, charge) {
			if (!err && charge && charge.status == 'succeeded') {
				var expireDate = (new Date).add(sum).months();

				placeManager.findOneAndUpdate({'jobs._id': id}, {
					"$set": {
						"jobs.$.expireDate": expireDate
					}
				}, function(){
					res.redirect('/message?message=jobfunded');
				});
			}
			else {
				res.redirect('/error');
			}

		});
	};
};