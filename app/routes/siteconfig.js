module.exports = function(config){
	return function (req, res) {
		var data = {
				sitename: config.sitename
			, url: config.url
			, imagesPath: global.imagesPath
			, twitterAccount: config.social.twitterAccount
			, apiKeys: {
				stripePublic: config.apiKeys.stripePublic
			}
		};

		res.send('window.siteconfig = ' + JSON.stringify(data));
	};
};