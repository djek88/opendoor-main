module.exports = function(siteconfig){
	return function(req, res) {
		res.send('window.siteconfig = ' + JSON.stringify(siteconfig));
	};
};