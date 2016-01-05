/**
 * Created by Vavooon on 04.01.2016.
 */

var args = process.argv.slice(2);
var fs = require('fs');
var csv = require('csv');
var geocoder = require('geocoder');
var config = require('./config.js');
var placeQueue = [];

var codesStats = {};

var delayIncrement = 200;


var startTime = Date.now();

var finishedRequests = 0;
var allRequests;

function sendGeocodeRequest(address, cb, delay) {

	delay = delay || 0;
	console.log(delay);
	setTimeout(function(){
		geocoder.geocode(address, function ( err, res ) {
			if (res.status == 'OVER_QUERY_LIMIT') {
					console.log(res.status);
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

		}, {api: config.apiKeys.googleMaps});


	}, delay);

}

function sendNewRequestFromQueue() {
	var place = placeQueue.shift();
	if (place) {
		sendGeocodeRequest(place.address, function (err, res) {


			if (res.results.length) {
				console.log(res.results[0].geometry.location);
			}
			else {
				console.log("Location was not found: ", place);
			}
			finishedRequests++;
			sendNewRequestFromQueue();
		});
	}
	else if (finishedRequests == allRequests) {
		console.log('All elements have been processed');
		console.log(codesStats);
		var executionTime = (Date.now() - startTime)/1000;
		var timePerRequest = Math.round((executionTime / allRequests) * 1000) / 1000;
		console.log('Execution time: ' + executionTime + 's, time per request: ' + timePerRequest + 's');
	}

}



console.log(args);
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
				for (var i=0; i<data.length; i++) {
					var place = data[i];
					var placeObject = {
							name: place[0]
						,	faith: place[9]
						, denomination: place[10]
					}

					var address = place.splice(2, 7);
					address.splice(2,1);
					placeObject.address = address.join(', ');

					placeQueue.push(placeObject);
					if (i>70) {
						break;
					}
				}
				allRequests = placeQueue.length;
				sendNewRequestFromQueue();
			});
		}
	})
}
