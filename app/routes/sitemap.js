module.exports = function(placeManager, sm, config, fs, path) {
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			var js2xmlparser = require("js2xmlparser");


			var sitemapItemsCount = 50000;


			var currentDate = (new Date).toString('yyyy-MM-dd');

			var staticSitemap = sm.createSitemap ({
				hostname: config.url
				, cacheTime: 600000
				, urls: [
					{ url: '/places/' }
					, { url: '/places/add' }
					, { url: '/places/search' }
					, { url: '/jobs/search' }
				]
			});
			fs.writeFile(path.join(__dirname, '../../static', 'sitemap_static.xml'), staticSitemap.toString(), function(){});


			var sitemapIndex = {
				'@': {
					xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
				}
				, sitemap: [{
					loc: config.url + '/sitemap_static.xml'
					, lastmod: currentDate
				}]
			};


			var placesPath = '/places/';
			var startItem = 0;
			var endItem = sitemapItemsCount;
			placeManager.find({}, {uri: true}, function(err, places){
				var sitemapCount = Math.ceil(places.length / sitemapItemsCount);
				if (endItem > places.length) {
					endItem = places.length;
				}
				var sitemap;
				for (var i=0; i < sitemapCount; i++) {

					sitemap = sm.createSitemap ({
						hostname: config.url
						, cacheTime: 600000
						// , urls: predefinedUrls
					});



					for (var j = startItem; j < endItem; j++) {
						sitemap.add({url: placesPath + places[j].uri});
					}

					startItem += j;
					endItem += j;
					if (endItem > places.length) {
						endItem = places.length;
					}

					sitemapIndex.sitemap.push({
						loc: config.url + '/' + 'sitemap_' + i + '.xml'
						, lastmod: currentDate
					});

					fs.writeFile(path.join(__dirname, '../../static', 'sitemap_' + i + '.xml'), sitemap.toString(), function(){});
				}
				fs.writeFile(path.join(__dirname, '../../static', 'sitemapindex.xml'), js2xmlparser('sitemapindex', sitemapIndex), function(){});

				res.redirect('/message?message=sitemapgenerated');

			});
		}
		else {
			res.redirect('/error');
		}

	};
};