var args = process.argv.slice(2);
var fs = require('fs');
var csv = require('csv');
var geocoder = require('geocoder');
var config = require('../config.js');
var sha1 = require('sha1');
require('../assets/js/utils.js');

var placeQueue = [];
var codesStats = {};
var delayIncrement = 200;
var outFileName = 'result.json';
var outContent = [];
var existingPlaceHashes = [];
var skippedPlaces = 0;
var startTime = Date.now();
var finishedRequests = 0;
var allRequests;

function createJsonLd(place) {
	var data = {
		'@type': 'Place'
		,	name: place.name
		,	mainentityofpage: config.url + '/places/' + place.uri
		,	geo: {
			'@type': 'GeoCoordinates'
			, latitude: place.location.coordinates[1]
			, longitude: place.location.coordinates[0]
		}
		,	address: {
			'@type': 'PostalAddress'
			,	addressCountry: place.address.country
			,	addressLocality: place.address.locality
			,	addressRegion: place.address.region
			,	postalCode: place.address.postalCode
			,	streetAddress: [place.address.line1, place.address.line2].cleanArray().join(', ')
		}
	};


	if (place.bannerPhoto) {
		data.image = config.url + '/photos/' + place.bannerPhoto;
	}

	if (place.about) {
		data.description = place.about;
	}

	if (place.phone) {
		data.telephone = place.phone;
	}

	if (place.averageRating) {
		data.aggregateRating = place.averageRating;
	}

	if (place.reviews.length) {
		data.review = [];
		for (var i=0; i < place.reviews.length; i++) {
			data.review.push({
				"@type": 'Review'
				,	author: place.reviews[i].name
				,	reviewBody: place.reviews[i].text
				,	reviewRating: {
					"@type": 'Rating'
					,	ratingValue: place.reviews[i].rating
				}
			})
		}
	}
	return data;
}

function sendGeocodeRequest(address, cb, delay) {
	delay = delay || 0;
	setTimeout(function(){
		geocoder.geocode(address, function(err, res ) {
			if (res.status == 'OVER_QUERY_LIMIT') {
				sendGeocodeRequest(address, cb, delay + delayIncrement);
			}
			else {
				cb(null, res);
			}

			// Gather some stats
			if (!codesStats[res.status]) {
				codesStats[res.status] = 1;
			}
			else {
				codesStats[res.status]++;
			}

		//}, {key: 'AIzaSyDANhr6hDNSuCe4451dQBdXHhO_bojAgZU'});
		}, {
			key: config.apiKeys.googleMapsServer
		});
	}, delay);
}

function showResusts() {
	console.log(codesStats);
	var executionTime = (Date.now() - startTime)/1000;
	var timePerRequest = Math.round((executionTime / allRequests) * 1000) / 1000;
	console.log('Execution time: ' + executionTime + 's, time per request: ' + timePerRequest + 's');
}

function sendNewRequestFromQueue() {
	var place = placeQueue.shift();

	if (place) {
		var hash =sha1(JSON.stringify(place));
		if (existingPlaceHashes.indexOf(hash) == -1) {
			sendGeocodeRequest(place.concatenatedAddress, function (err, res) {
				if (res.results.length) {
					place.location = {type: 'Point', coordinates: [res.results[0].geometry.location.lng, res.results[0].geometry.location.lat]};
					place.jsonLd = createJsonLd(place);
					place.hash = hash;
					console.log("Location was found: ", place.name);
					outContent.push(place);
				}
				else {
					console.log("Location was not found: ", place);
				}
				finishedRequests++;
				sendNewRequestFromQueue();
			});
		}
		else {
			skippedPlaces++;
			finishedRequests++;
			sendNewRequestFromQueue();
		}

	}
	else if (finishedRequests == allRequests) {
		console.log('All elements have been processed');
		showResusts();
	}
}

fs.readFile(outFileName, 'utf8', function (err, data) {
	//if (err) throw err;

	if (data) {
		try {
			outContent = JSON.parse(data);
		}
		catch(e) {

		}

		for (var i = 0; i < outContent.length; i++) {
			if (outContent[i].hash) {
				existingPlaceHashes.push(outContent[i].hash);
			}
		}
	}

	if (!args.length) return console.log("Please provide at least CSV filename");

	var fileName = args[0];
	fs.readFile(fileName, 'utf8', function(err, content){
		if (err) return console.log(err);

		csv.parse(content, function(err, data) {
			for (var i=1; i<data.length; i++) {
				var placeAsArray = data[i];
				for (var j=0; j < placeAsArray.length; j++) {
					placeAsArray[j] = placeAsArray[j].trim();
				}

				var place = {
					name: placeAsArray[0],
					address: {
						line1: [placeAsArray[1], placeAsArray[2], placeAsArray[3], placeAsArray[4]].cleanArray().join(', '),
						line2: '',
						locality: placeAsArray[5],
						region: placeAsArray[6],
						country: placeAsArray[8],
						postalCode: placeAsArray[7]
					},
					religion: 'Christianity',
					groupName: 'RCCG',
					isConfirmed: true,
					denominations: [],
					reviews: [],
					events: [],
					promotions: [],
					jobs: [],
					ratingsCount: 0,
					averageRating: 1
				};

				place.uri = [
					place.address.country.replace(/\//g, '-'),
					place.address.region.replace(/\//g, '-'),
					place.address.locality.replace(/\//g, '-'),
					place.religion.replace(/\//g, '-'),
					place.groupName.replace(/\//g, '-'),
					place.name.replace(/\//g, '-')
				].join('/').replace(/_/g, '').replace(/[^\-a-zA-Z0-9/\s]/g, '').replace(/\s+/g, '-');
				place.concatenatedAddress = [place.address.line1, place.address.line2, place.address.locality, place.address.region, place.address.country, place.address.postalCode].cleanArray().join(', ');
				placeQueue.push(place);
				//if (i>4) {
				//	break;
				//}
			}

			allRequests = placeQueue.length;
			sendNewRequestFromQueue();
		});
	});
});

process.on('SIGINT', process.exit);

process.on('exit', function() {
	if (finishedRequests && finishedRequests > skippedPlaces) {
		showResusts();
		fs.writeFileSync(outFileName, JSON.stringify(outContent, null, '\t'), 'utf8');
	}
});


// Do import with mongoimport --db opendoor --collection places --type json --file "path-to\result_proper_addrs.json" --jsonArray