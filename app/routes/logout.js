module.exports = function(){
	return function (req, res) {
		delete req.session.user;
		res.clearCookie('_id');
		res.clearCookie('email');
		res.clearCookie('isAdmin');
		res.redirect('/');
	};
};