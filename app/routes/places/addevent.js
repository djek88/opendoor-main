module.exports = function(placeManager){
	return function (req, res) {
		if (req.session.user) {
			var id = req.params.id;
			placeManager.findOne({_id: id}, function(err, place){
				if (place.maintainer == req.session.user._id)	{
					var locationAsString = req.body.location.split(',');
					var data = {
						name: req.body.name
						,	date: new Date(req.body.date)
						,	description: req.body.description
						,	address: req.body.address
						, location: {
							type: 'Point',
							coordinates: [
								parseFloat(locationAsString[0]) || null
								, parseFloat(locationAsString[1]) || null
							]
						}
					};

					placeManager.addEvent(id, data, function(err, place){
						if (!err && place) {
							console.log('Event for place ' + id + ' was added');
							res.redirect('/message?message=eventadded&back=' + encodeURIComponent('/places/' + place.uri));
						}
						else {
							console.log(err);
							res.redirect('/error');
						}
					});
				}
				else {
					res.end();
				}

			});

		}
		else {
			res.end();
		}
	};
};