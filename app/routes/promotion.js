module.exports = function(placeManager, stripe){
	return function (req, res) {
		var data = req.body;
		data.months = parseFloat(req.body.months);
		console.log(data);
		stripe.charges.create({
			amount: data.months * 1000, // amount in cents, again
			currency: "usd",
			source: data.token,
			description: "Place promotion"
		}, function(err, charge) {
			if (!err && charge && charge.status == 'succeeded') {
				var expireDate = new Date();
				expireDate.add(data.months).months();
				placeManager.addPromotion(req.params.id, {name: req.body.name, url: req.body.url, expireDate: expireDate}, function(err, place){
					if (!err && place && place.promotions.length) {
						res.redirect('/promotion/' + place.promotions[place.promotions.length-1]._id);
					}
					else {
						console.log(err);
						res.redirect('/message?message=promotionerror&back=' + encodeURIComponent('/places/' + place.uri));
					}
				});
			}
			else {
				console.log(err);
				res.redirect('/message?message=promotionerror&back=' + encodeURIComponent('/places/' + place.uri));
			}

		});
	};
};