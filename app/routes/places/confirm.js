module.exports = function(placeManager){
	return function (req, res) {
		var id = req.params.id;
		placeManager.markAsConfirmed(id, function(err, place){
			if (!err && place) {
				console.log('Place with ' + id + ' was confirmed');
				res.redirect('/message?message=placeconfirmed');
			}
			else {
				res.redirect('/error?message=placeconfirmationerror');
			}
		});
	};
};