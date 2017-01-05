module.exports = function(userManager, config, mail){
	return function (req, res) {
		mail.sendFeedback({
				name: req.body.name
			,	email: req.body.email
			,	target: req.body.target
			,	note: req.body.note
		});

		res.redirect('/message?message=feedbacksaved');
		res.end();
	};
};