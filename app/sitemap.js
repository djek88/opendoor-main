module.exports = function(placeManager, sm, config, fs, path) {
	return function (req, res) {
		var sitemap = sm.createSitemap ({
			hostname: config.url
			, cacheTime: 600000
			, urls: [

				{ url: '/places/' }
				, { url: '/places/add' }
				, { url: '/places/search' }
				, { url: '/jobs/search' }
			]
		});
		var placesPath = '/places/';
		placeManager.find({}, {uri: true}, function(err, places){
			for (var i=0; i < places.length; i++) {
				sitemap.add({url: placesPath + places[i].uri});
			}
			fs.writeFile(path.join(__dirname, '../static', 'sitemap.xml'), sitemap.toString(), function(err){
				if (!err) {
					res.redirect('/message?message=sitemapgenerated');
				}
				else {
					res.redirect('/error');
				}
			});
		});
	};
};