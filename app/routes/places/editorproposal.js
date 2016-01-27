module.exports = function(email){
	return function (req, res) {
		if (req.session.user) {
			var id = req.params.id;
			var options = {
				id: id
				,recipientEmail: req.body.email
			};

			email.sendEditorProposal(options, function(){
				res.redirect('/message?message=proposalsent');
			})
		}
	};
};