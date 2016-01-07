/**
 * Created by Vavooon on 04.01.2016.
 */

var args = process.argv.slice(2);
var fs = require('fs');
var csv = require('csv');
var geocoder = require('geocoder');
var config = require('./config.js');
var sha1 = require('sha1');
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


function sendGeocodeRequest(address, cb, delay) {

	delay = delay || 0;
	setTimeout(function(){
		geocoder.geocode(address, function ( err, res ) {
			if (res.status == 'OVER_QUERY_LIMIT') {
				sendGeocodeRequest(address, cb, delay + delayIncrement);
				console.log(res.status);
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
		}, {key: config.apiKeys.googleMapsServer});


	}, delay);

}

function sendNewRequestFromQueue() {
	var place = placeQueue.shift();

	if (place) {
		var hash =sha1(JSON.stringify(place));
		if (existingPlaceHashes.indexOf(hash) == -1) {
			sendGeocodeRequest(place.address, function (err, res) {
				if (res.results.length) {
					place.location = {type: 'Point', coordinates: [res.results[0].geometry.location.lat, res.results[0].geometry.location.lng]};
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
		console.log(codesStats);
		var executionTime = (Date.now() - startTime)/1000;
		var timePerRequest = Math.round((executionTime / allRequests) * 1000) / 1000;
		console.log('Execution time: ' + executionTime + 's, time per request: ' + timePerRequest + 's');

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
	if (!args.length) {
		console.err("Please provide at least CSV filename");
	}
	else {
		var fileName = args[0];
		fs.readFile(fileName, 'utf8', function(err, content){
			if (err) {
				console.log(err);
			}
			else {
				csv.parse(content, function(err, data) {
					for (var i=1; i<data.length; i++) {
						var place = data[i];
						for (var j=0; j<place.length; j++) {
							place[j] = place[j].trim();
						}
						var placeObject = {
								name: place[0]
							, postalCode: place[7]
							,	religion: place[9]
							, denomination: place[10]
							,	isConfirmed: true
						};

						var address = place.splice(2, 7);
						for (var j=0; j<address.length; j++) {
							if (!address[j].length) {
								address.splice(j, 1);
							}
						}
						placeObject.address = address.join(', ');

						placeQueue.push(placeObject);
						//if (i>9) {
						//	break;
						//}
					}
					allRequests = placeQueue.length;
					sendNewRequestFromQueue();
				});
			}
		})
	}
});

process.on('SIGINT', process.exit);

process.on('exit', function() {
	if (finishedRequests && finishedRequests > skippedPlaces) {
		fs.writeFileSync(outFileName, JSON.stringify(outContent, null, '\t'), 'utf8');
	}
});