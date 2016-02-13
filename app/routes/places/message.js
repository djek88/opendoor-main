module.exports = function(placeManager, email){
	return function (req, res) {
		var id = req.body.id;
		var data = {
			subject: req.body.subject
			,	text: req.body.text
		};

		if (req.session.user) {
			data.senderEmail = req.session.user.email;
		}
		else {
			data.senderEmail = req.body.email;
		}

		placeManager.findOne({_id: id}, function(err, place) {
			if (place && place.email) {
				data.recipientEmail = place.email;
				email.sendMessage(data, function(){
					res.redirect('/message?message=messagesent&back=' + encodeURIComponent('/places/' + place.uri))
				});
			}
		});
	};
};
