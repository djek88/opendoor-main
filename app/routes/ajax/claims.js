module.exports = function(claimManager){
	return function (req, res) {

		if (req.session.user && req.session.user.isAdmin) {
			claimManager.findAll(function (err, claims) {
				res.send(JSON.stringify(claims));
			});
		}
		else {
			res.end();
		}
	};
};