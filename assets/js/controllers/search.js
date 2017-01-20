/**
 * Created by vavooon on 24.03.16.
 */

define(['angular', 'app', 'locationpicker'], function(angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('SearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$cookies',
		function($scope, $http, $rootScope, $location, $cookies) {
			console.log('tic', $scope.userIp);

			var map;
			var reqParams = $location.search();
			var $table = $('#search-table');
			var prevLocation = {
				lat: Number($cookies.get('latitude')),
				lng: Number($cookies.get('longitude'))
			};

			$scope.places = null;
			$scope.message = 'Getting Your Current Location';
			$scope.religion = '';

			$scope.mouseOver = mouseOver;
			$scope.mouseOut = mouseOut;

			$('.location-picker').locationpicker({
				autoDetect: false,
				onLocationDetected: function(errMsg) {
					$scope.$apply(function() {
						if (errMsg) return onError(errMsg);

						setSearchParams();
					});
				}
			});

			if (isValidLatitude(reqParams.lat) && isValidLongitude(reqParams.lng)) {
				searchPlaces();
				onLocationDetectComplete();
			} else if (isValidLatitude(prevLocation.lat) &&
					isValidLongitude(prevLocation.lng)) {
				document.forms.form.location.value = prevLocation.lng + ', ' + prevLocation.lat;
				setSearchParams();
			} else {
				searchPlacesByIp(onLocationDetectComplete);
			}

			function searchPlaces() {
				console.log('searchPlaces');

				$scope.lat = reqParams.lat;
				$scope.lng = reqParams.lng;
				document.forms.form.location.value = reqParams.lng + ', ' + reqParams.lat;
				$scope.address = $rootScope.lastSearchAddress || document.forms.form.location.value;
				$scope.religion = reqParams.religion;
				$scope.message = 'Searching…';
				reqParams.maxDistance = reqParams.maxDistance || 5000;

				$http({
					url: '/ajax/places/search',
					method: 'GET',
					params: reqParams
				}).then(displayResults, onError);
			}

			function searchPlacesByIp(cb) {
				var prom = $http({
					url: '/ajax/places/search',
					method: 'GET',
					params: {maxDistance: 10000}
				});
				prom.then(cb);
				prom.then(displayResults, onError);
			}

			function setSearchParams() {
				console.log('setSearchParams');
				var location = document.forms.form.location.value.split(', ');

				if (location.length === 2) {
					var reqParams = {
						lat: location[1],
						lng: location[0],
						religion: $scope.religion
					};

					saveCoordinatesInCookies(reqParams.lat, reqParams.lng);

					$location.search('lat', reqParams.lat || null);
					$location.search('lng', reqParams.lng || null);
					$location.search('religion', reqParams.religion || null);
					$rootScope.lastSearchAddress = $scope.address;
				}
			}

			function displayResults(response) {
				response = response.data;

				////////////////////////////////
				response = JSON.parse('{"results":[{"_id":"56c635918a8e8be0c0bfcc49","address":{"line1":"The Vale Community Centre, 1 Pentland Road","line2":"","locality":"Kilburn","region":"London","country":"England","postalCode":"NW6 5RT"},"averageRating":0,"concatenatedAddress":"The Vale Community Centre, 1 Pentland Road, Kilburn, London, England, NW6 5RT","denominations":[],"events":[],"groupName":"RCCG","hash":"f127ea9c58e4d163f2ecd8da04f46310a860a396","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"The Sowers Kilburn","geo":{"@type":"GeoCoordinates","latitude":51.53178219999999,"longitude":-0.1963767},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"Kilburn","addressRegion":"London","postalCode":"NW6 5RT","streetAddress":"The Vale Community Centre, 1 Pentland Road"},"mainentityofpage":"https://opendoor.ooo/places/england/london/kilburn/christianity/rccg/the-sowers-kilburn"},"location":{"type":"Point","coordinates":[-0.1963767,51.53178219999999]},"name":"The Sowers Kilburn","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/kilburn/christianity/rccg/the-sowers-kilburn","distance":704.9159058160787},{"_id":"56c635948a8e8be0c0c0bce2","address":{"line1":"1 Stafford Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"NW6 5RS"},"averageRating":0,"concatenatedAddress":"1 Stafford Road, London, Greater London, United Kingdom, NW6 5RS","denominations":[],"events":[],"groupName":"Catholic","hash":"fa3706ea134ca239c034b8ece5ef8a2c921f2002","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Immaculate Heart of Mary","geo":{"@type":"GeoCoordinates","latitude":51.5309313,"longitude":-0.1956552},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"NW6 5RS","streetAddress":"1 Stafford Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/immaculate-heart-of-mary"},"location":{"type":"Point","coordinates":[-0.1956552,51.5309313]},"name":"Immaculate Heart of Mary","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/immaculate-heart-of-mary","distance":744.4199376604439},{"_id":"56c635948a8e8be0c0c0bcfc","address":{"line1":"337 Harrow Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W9 3RB"},"averageRating":0,"concatenatedAddress":"337 Harrow Road, London, Greater London, United Kingdom, W9 3RB","denominations":[],"events":[],"groupName":"Catholic","hash":"ddfaa9b609a7ddd0d1b100f13fe75c84226bc893","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Our Lady of Lourdes & St Vincent de Paul","geo":{"@type":"GeoCoordinates","latitude":51.5236202,"longitude":-0.1998787},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W9 3RB","streetAddress":"337 Harrow Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/our-lady-of-lourdes-st-vincent-de-paul"},"location":{"type":"Point","coordinates":[-0.1998787,51.5236202]},"name":"Our Lady of Lourdes & St Vincent de Paul","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/our-lady-of-lourdes-st-vincent-de-paul","distance":904.8469028760774},{"_id":"56c635918a8e8be0c0bfcc47","address":{"line1":"25 Alpha House, Kilburn","line2":"","locality":"Kilburn","region":"London","country":"England","postalCode":"NW6 5TE"},"averageRating":0,"concatenatedAddress":"25 Alpha House, Kilburn, Kilburn, London, England, NW6 5TE","denominations":[],"events":[],"groupName":"RCCG","hash":"43756f3762b2a9babb2c78221ecb2a6a2b7e31bb","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"The Shepherd’S House Hammersmith","geo":{"@type":"GeoCoordinates","latitude":51.5358463,"longitude":-0.19401},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"Kilburn","addressRegion":"London","postalCode":"NW6 5TE","streetAddress":"25 Alpha House, Kilburn"},"mainentityofpage":"https://opendoor.ooo/places/england/london/kilburn/christianity/rccg/the-shepherds-house-hammersmith"},"location":{"type":"Point","coordinates":[-0.19401,51.5358463]},"name":"The Shepherd’S House Hammersmith","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/kilburn/christianity/rccg/the-shepherds-house-hammersmith","distance":1033.6078262461106},{"_id":"56c635948a8e8be0c0c0bd69","address":{"line1":"Chamberlayne Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"NW10 3NS"},"averageRating":0,"concatenatedAddress":"Chamberlayne Road, London, Greater London, United Kingdom, NW10 3NS","denominations":[],"events":[],"groupName":"Catholic","hash":"5815e92aefcefaaf3441b8972bd1f7cc6e3ec3f7","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Transfiguration","geo":{"@type":"GeoCoordinates","latitude":51.534964,"longitude":-0.2197274},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"NW10 3NS","streetAddress":"Chamberlayne Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/transfiguration"},"location":{"type":"Point","coordinates":[-0.2197274,51.534964]},"name":"Transfiguration","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/transfiguration","distance":1039.818133784575},{"_id":"56c635918a8e8be0c0bfcbad","address":{"line1":"Hazel Road Community Hall, Hazel Road, Kensal Green(Off Harrow Road)","line2":"","locality":"Kensal Green","region":"London","country":"England","postalCode":"NW10 5PP"},"averageRating":0,"concatenatedAddress":"Hazel Road Community Hall, Hazel Road, Kensal Green(Off Harrow Road), Kensal Green, London, England, NW10 5PP","denominations":[],"events":[],"groupName":"RCCG","hash":"fd7ba9641265bd0a685bb057dc5184cbc1e179aa","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Open Heavens New Horizons Kensal Green","geo":{"@type":"GeoCoordinates","latitude":51.530112,"longitude":-0.2253},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"Kensal Green","addressRegion":"London","postalCode":"NW10 5PP","streetAddress":"Hazel Road Community Hall, Hazel Road, Kensal Green(Off Harrow Road)"},"mainentityofpage":"https://opendoor.ooo/places/england/london/kensal-green/christianity/rccg/open-heavens-new-horizons-kensal-green"},"location":{"type":"Point","coordinates":[-0.2253,51.530112]},"name":"Open Heavens New Horizons Kensal Green","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/kensal-green/christianity/rccg/open-heavens-new-horizons-kensal-green","distance":1310.5541619604783},{"_id":"56c635948a8e8be0c0c0bd10","address":{"line1":"Quex Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"NW6 4PL"},"averageRating":0,"concatenatedAddress":"Quex Road, London, Greater London, United Kingdom, NW6 4PL","denominations":[],"events":[],"groupName":"Catholic","hash":"0812ff4b186307836d70a0110e2cff1258b9c9d8","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Sacred Heart of Jesus","geo":{"@type":"GeoCoordinates","latitude":51.5400747,"longitude":-0.194291},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"NW6 4PL","streetAddress":"Quex Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/sacred-heart-of-jesus"},"location":{"type":"Point","coordinates":[-0.194291,51.5400747]},"name":"Sacred Heart of Jesus","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/sacred-heart-of-jesus","distance":1341.572194926078},{"_id":"56c635948a8e8be0c0c0bd01","address":{"line1":"17 Cirencester Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W2 5SR"},"averageRating":0,"concatenatedAddress":"17 Cirencester Street, London, Greater London, United Kingdom, W2 5SR","denominations":[],"events":[],"groupName":"Catholic","hash":"38ad49d8947af0518210008b7af41065e333d0e6","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Our Lady of Sorrows","geo":{"@type":"GeoCoordinates","latitude":51.5215068,"longitude":-0.1913219},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W2 5SR","streetAddress":"17 Cirencester Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/our-lady-of-sorrows"},"location":{"type":"Point","coordinates":[-0.1913219,51.5215068]},"name":"Our Lady of Sorrows","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/our-lady-of-sorrows","distance":1459.2195307712136},{"_id":"56c635948a8e8be0c0c0bd58","address":{"line1":"Moorhouse Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W2 5DJ"},"averageRating":0,"concatenatedAddress":"Moorhouse Road, London, Greater London, United Kingdom, W2 5DJ","denominations":[],"events":[],"groupName":"Catholic","hash":"36254ee69ea426e3011ed4d7e4461f39befe6cef","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Mary of the Angels","geo":{"@type":"GeoCoordinates","latitude":51.5163074,"longitude":-0.1979792},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W2 5DJ","streetAddress":"Moorhouse Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-mary-of-the-angels"},"location":{"type":"Point","coordinates":[-0.1979792,51.5163074]},"name":"St. Mary of the Angels","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-mary-of-the-angels","distance":1701.2766646131456},{"_id":"56c635948a8e8be0c0c0bcf3","address":{"line1":"","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"NW6 1QE"},"averageRating":0,"concatenatedAddress":"London, Greater London, United Kingdom, NW6 1QE","denominations":[],"events":[],"groupName":"Catholic","hash":"603a5bccebf009af0d3d4ed4705dc80b128c4f2c","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Our Lady of Lebanon Lebanese Church","geo":{"@type":"GeoCoordinates","latitude":51.5516195,"longitude":-0.2010339},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"NW6 1QE","streetAddress":""},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/our-lady-of-lebanon-lebanese-church"},"location":{"type":"Point","coordinates":[-0.2010339,51.5516195]},"name":"Our Lady of Lebanon Lebanese Church","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/our-lady-of-lebanon-lebanese-church","distance":2361.991650782233},{"_id":"56c635948a8e8be0c0c0bd28","address":{"line1":"Pottery Lane","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W11 4NQ"},"averageRating":0,"concatenatedAddress":"Pottery Lane, London, Greater London, United Kingdom, W11 4NQ","denominations":[],"events":[],"groupName":"Catholic","hash":"64c7f791a0d89a99cce79bcca8d450b00cf36a99","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Francis of Assisi","geo":{"@type":"GeoCoordinates","latitude":51.5088571,"longitude":-0.2099252},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W11 4NQ","streetAddress":"Pottery Lane"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-francis-of-assisi"},"location":{"type":"Point","coordinates":[-0.2099252,51.5088571]},"name":"St. Francis of Assisi","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-francis-of-assisi","distance":2439.90546072507},{"_id":"56c635948a8e8be0c0c0bd02","address":{"line1":"4A Inverness Place","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W2 3JF"},"averageRating":0,"concatenatedAddress":"4A Inverness Place, London, Greater London, United Kingdom, W2 3JF","denominations":[],"events":[],"groupName":"Catholic","hash":"e137d2760ff46a824c248d407058bc8dc13afa48","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Our Lady Queen of Heaven","geo":{"@type":"GeoCoordinates","latitude":51.5123044,"longitude":-0.1870292},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W2 3JF","streetAddress":"4A Inverness Place"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/our-lady-queen-of-heaven"},"location":{"type":"Point","coordinates":[-0.1870292,51.5123044]},"name":"Our Lady Queen of Heaven","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/our-lady-queen-of-heaven","distance":2444.783449563585},{"_id":"56c635918a8e8be0c0bfcb82","address":{"line1":"187 Freston Road, London, Notting Hill Gate","line2":"","locality":"London","region":"Greater London","country":"England","postalCode":"W10 6TH"},"averageRating":0,"concatenatedAddress":"187 Freston Road, London, Notting Hill Gate, London, Greater London, England, W10 6TH","denominations":[],"events":[],"groupName":"RCCG","hash":"f5b81384e6aef725914b0abb4fcc7a7fb048207d","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Love Assembly Notting Hill Gate","geo":{"@type":"GeoCoordinates","latitude":51.5090387,"longitude":-0.196776},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"London","addressRegion":"Greater London","postalCode":"W10 6TH","streetAddress":"187 Freston Road, London, Notting Hill Gate"},"mainentityofpage":"https://opendoor.ooo/places/england/greater-london/london/christianity/rccg/love-assembly-notting-hill-gate"},"location":{"type":"Point","coordinates":[-0.196776,51.5090387]},"name":"Love Assembly Notting Hill Gate","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/greater-london/london/christianity/rccg/love-assembly-notting-hill-gate","distance":2497.938982675136},{"_id":"56c635918a8e8be0c0bfcbf6","address":{"line1":"The Community Venue O2 Centre, 225 Finchley Road","line2":"","locality":"Finchley","region":"London","country":"England","postalCode":"NW3 6LP"},"averageRating":0,"concatenatedAddress":"The Community Venue O2 Centre, 225 Finchley Road, Finchley, London, England, NW3 6LP","denominations":[],"events":[],"groupName":"RCCG","hash":"3ad14863b4b292840ae4c850e832fff41e07a7b4","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Rivers Of Joy Finchley Road","geo":{"@type":"GeoCoordinates","latitude":51.5470959,"longitude":-0.1800505},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"Finchley","addressRegion":"London","postalCode":"NW3 6LP","streetAddress":"The Community Venue O2 Centre, 225 Finchley Road"},"mainentityofpage":"https://opendoor.ooo/places/england/london/finchley/christianity/rccg/rivers-of-joy-finchley-road"},"location":{"type":"Point","coordinates":[-0.1800505,51.5470959]},"name":"Rivers Of Joy Finchley Road","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/finchley/christianity/rccg/rivers-of-joy-finchley-road","distance":2583.2131918190644},{"_id":"56c635948a8e8be0c0c0bd5f","address":{"line1":"3 Adamson Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"NW3 3HX"},"averageRating":0,"concatenatedAddress":"3 Adamson Road, London, Greater London, United Kingdom, NW3 3HX","denominations":[],"events":[],"groupName":"Catholic","hash":"bffd92b05a53df40a30e562b7ea9951423b0fc45","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Thomas More","geo":{"@type":"GeoCoordinates","latitude":51.5443411,"longitude":-0.1733537},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"NW3 3HX","streetAddress":"3 Adamson Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-thomas-more"},"location":{"type":"Point","coordinates":[-0.1733537,51.5443411]},"name":"St. Thomas More","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-thomas-more","distance":2748.119116881381},{"_id":"56c635918a8e8be0c0bfcc50","address":{"line1":"White City Community Centre, India Way","line2":"","locality":"White City Estate","region":"London","country":"England","postalCode":"W12 7QT"},"averageRating":0,"concatenatedAddress":"White City Community Centre, India Way, White City Estate, London, England, W12 7QT","denominations":[],"events":[],"groupName":"RCCG","hash":"f200a350f0dd5d73ce6eebd17e7b5dbc842f0f17","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Throne Of Grace White City","geo":{"@type":"GeoCoordinates","latitude":51.5114965,"longitude":-0.233682},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"White City Estate","addressRegion":"London","postalCode":"W12 7QT","streetAddress":"White City Community Centre, India Way"},"mainentityofpage":"https://opendoor.ooo/places/england/london/white-city-estate/christianity/rccg/throne-of-grace-white-city"},"location":{"type":"Point","coordinates":[-0.233682,51.5114965]},"name":"Throne Of Grace White City","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/white-city-estate/christianity/rccg/throne-of-grace-white-city","distance":2850.458335765749},{"_id":"56c635948a8e8be0c0c0bd18","address":{"line1":"High Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":""},"averageRating":0,"concatenatedAddress":"High Street, London, Greater London, United Kingdom","denominations":[],"events":[],"groupName":"Catholic","hash":"dfea151b570c9ff876a65b357b2109b079f092ba","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Augustine of Canterbury","geo":{"@type":"GeoCoordinates","latitude":51.5355996,"longitude":-0.2476982},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"","streetAddress":"High Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-augustine-of-canterbury"},"location":{"type":"Point","coordinates":[-0.2476982,51.5355996]},"name":"St. Augustine of Canterbury","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-augustine-of-canterbury","distance":2912.3160185860497}],"count":17}');
				////////////////////////////////

				if (typeof response != 'object' && !Array.isArray(response.results)) {
					return onError();
				}

				var places = response.results;

				if (isValidLatitude(response.lat) && isValidLongitude(response.lng)) {
					document.forms.form.location.value = response.lng + ', ' + response.lat;
					saveCoordinatesInCookies(response.lat, response.lng);
				}

				$scope.message = places.length ? '' : 'There are no places of worship found near this location';

				for (var i = 0; i < places.length; i++) {
					places[i].distance = Math.round(places[i].distance);
				}

				$scope.places = places;
				createMap();
			}

			function createMap() {
				console.log('createMap');
				if ($scope.message.length) return;

				$rootScope.getMapInstance($('#results-map')).then(function(m) {
					map = m;

					configureAutoUploadMap(map);

					/*google.maps.event.addListenerOnce(map, 'idle', function() {
						console.log('map idle event');
						addMarkers($scope.places);
					});*/

					addMarkers($scope.places);
				});
			}

			function configureAutoUploadMap(map) {
				var timerId;

				google.maps.event.addListener(map, 'dragstart', function() {
					console.log('dragstart');
					clearTimeout(timerId);

					google.maps.event.addListenerOnce(map, 'dragend', function() {
						console.log('dragend');

						timerId = setTimeout(function() {
							console.log('timeout', map.getCenter().lat(), map.getCenter().lng());

							var lat = map.getCenter().lat();
							var lng = map.getCenter().lng();

							$http({
								url: '/ajax/places/search',
								method: 'GET',
								params: {
									lat: lat,
									lng: lng,
									maxDistance: 5000
								}
							}).then(function(response) {
								response = response.data;

								if (typeof response != 'object' && !Array.isArray(response.results)) {
									return onError();
								}

								var places = response.results;

								$scope.message = places.length ? '' : 'There are no places of worship found near this location';

								for (var i = 0; i < places.length; i++) {
									places[i].distance = Math.round(places[i].distance);
								}

								$scope.places = places;

								if ($scope.message.length) return;




								var bounds = new google.maps.LatLngBounds();
								var location = [lng, lat];
								map.removeMarkers();

								// add marker for user location
								map.addMarker({
									position: {lat: parseFloat(location[1]), lng: parseFloat(location[0])},
									map: map,
									icon: map.icons.location,
									title: 'My location'
								});

								var data = $scope.places;

								// add markers for churches
								for(var i = 0; i < data.length; i++) {
									var pos = new google.maps.LatLng(data[i].location.coordinates[1], data[i].location.coordinates[0]);

									// I mirror all markers against search position in order to keep it in center of map
									var mirroredPoint = mirrorPoint(data[i].location.coordinates, location);
									var mirroredPos = new google.maps.LatLng(mirroredPoint[1], mirroredPoint[0]);
									var marker = map.addMarker({
										position: pos,
										map: map,
										icon: map.icons.brightPoi,
										title: data[i].name,
									});
									bounds.extend(pos);
									bounds.extend(mirroredPos);

									setMarkerMouseEventsHandlers(marker, i);
								}

								google.maps.event.trigger(map, 'resize');
								map.fitBounds(bounds);

								function setMarkerMouseEventsHandlers(marker, i) {
									google.maps.event.addListener(marker, 'mouseover', function () {
										marker.setIcon(map.icons.defaultPoi);
										$('tr:nth-child(' + (i + 1) + ')', $table).addClass('hover');
									});
									google.maps.event.addListener(marker, 'mouseout', function () {
										marker.setIcon(map.icons.brightPoi);
										$('tr:nth-child(' + (i + 1) + ')', $table).removeClass('hover');
									});
								}
								// display churches without recreating map
								// need to do refactoring work on displayResults
								// and other nested functions
							}, onError);
						}, 1000);
					});
				});
			}

			function addMarkers(data) {
				console.log('addMarkers');
				var bounds = new google.maps.LatLngBounds();
				var location = document.forms.form.location.value.split(', ');
				map.removeMarkers();
				// add marker for user location
				map.addMarker({
					position: {lat: parseFloat(location[1]), lng: parseFloat(location[0])},
					map: map,
					icon: map.icons.location,
					title: 'My location'
				});

				// add markers for churches
				for(var i = 0; i < data.length; i++) {
					var pos = new google.maps.LatLng(data[i].location.coordinates[1], data[i].location.coordinates[0]);

					// I mirror all markers against search position in order to keep it in center of map
					var mirroredPoint = mirrorPoint(data[i].location.coordinates, location);
					var mirroredPos = new google.maps.LatLng(mirroredPoint[1], mirroredPoint[0]);
					var marker = map.addMarker({
						position: pos,
						map: map,
						icon: map.icons.brightPoi,
						title: data[i].name,
					});
					bounds.extend(pos);
					bounds.extend(mirroredPos);

					setMarkerMouseEventsHandlers(marker, i);
				}

				google.maps.event.trigger(map, 'resize');
				map.fitBounds(bounds);

				function setMarkerMouseEventsHandlers(marker, i) {
					google.maps.event.addListener(marker, 'mouseover', function () {
						marker.setIcon(map.icons.defaultPoi);
						$('tr:nth-child(' + (i + 1) + ')', $table).addClass('hover');
					});
					google.maps.event.addListener(marker, 'mouseout', function () {
						marker.setIcon(map.icons.brightPoi);
						$('tr:nth-child(' + (i + 1) + ')', $table).removeClass('hover');
					});
				}
			}

			function onLocationDetectComplete() {
				console.log('onLocationDetectComplete');
				$scope.message = 'Press "Search" to find nearest place of worship to you';
				$scope.searchComplete = true;
			}

			function saveCoordinatesInCookies(lat, lng) {
				$cookies.put('latitude', lat);
				$cookies.put('longitude', lng);
			}

			function mouseOut(i) {
				map.markers[i + 1].setIcon(map.icons.brightPoi);
			}

			function mouseOver(i) {
				map.markers[i + 1].setIcon(map.icons.defaultPoi);
			}

			function mirrorPoint(p, o) {
				var px = p[0];
				var py = p[1];
				var ox = o[0];
				var oy = o[1];
				return [ox * 2 - px, oy * 2 - py];
			}

			function isValidLatitude(lat) {
				console.log('isValidLatitude');
				return lat !== null && isFinite(lat) && Math.abs(lat) <= 90;
			}

			function isValidLongitude(lng) {
				console.log('isValidLongitude');
				return lng !== null && isFinite(lng) && Math.abs(lng) <= 180;
			}

			function onError(msg) {
				console.log('onError');
				$scope.message = msg || 'Occur error during request!';
				$scope.places = null;
			}
		}
	]);
});