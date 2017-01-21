/**
 * Created by vavooon on 24.03.16.
 */

define(['angular', 'app', 'locationpicker'], function(angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('SearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$cookies',
		function($scope, $http, $rootScope, $location, $cookies) {
			console.log('tic', $scope.userIp);

			var map;
			var USERMARKERTITLE = 'My location';
			var urlParams = $location.search();
			var $table = $('#search-table');
			var prevLocation = {
				lat: Number($cookies.get('latitude')),
				lng: Number($cookies.get('longitude'))
			};

			$scope.places = null;
			$scope.message = 'Getting Your Current Location';

			$scope.mouseOver = mouseOver;
			$scope.mouseOut = mouseOut;

			$('.location-picker').locationpicker({
				autoDetect: false,
				onLocationDetected: function(errMsg) {
					$scope.$apply(function() {
						if (errMsg) return onError(errMsg);

						setUrlParams();
					});
				}
			});

			if (isValidLatitude(urlParams.lat) && isValidLongitude(urlParams.lng)) {
				$scope.message = 'Searching…';

				searchPlaces(urlParams, function(places) {
					saveLatLng(urlParams.lat, urlParams.lng);
					updateScopeProperties(places);

					$scope.searchComplete = true;

					createMap();
				});
			} else if (isValidLatitude(prevLocation.lat) && isValidLongitude(prevLocation.lng)) {
				document.forms.form.location.value = prevLocation.lng + ', ' + prevLocation.lat;
				setUrlParams();
			} else {
				$scope.message = 'Searching…';

				searchPlacesByIp(function(places, lat, lng) {
					saveLatLng(lat, lng);
					updateScopeProperties();

					$scope.searchComplete = true;

					createMap();
				});
			}

			function saveLatLng(lat, lng) {
				$scope.lat = lat;
				$scope.lng = lng;
				document.forms.form.location.value = lng + ', ' + lat;
				saveLatLngInCookies(lat, lng);
			}

			function searchPlaces(params, cb) {
				$http({
					url: '/ajax/places/search',
					method: 'GET',
					params: params
				}).then(function(response) {
					/////////////////////
					/*response = {data: {"results":[
							{"_id":"56c635948a8e8be0c0c0bced","address":{"line1":"Leicester Place","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"WC2H 7BP"},"averageRating":0,"concatenatedAddress":"Leicester Place, London, Greater London, United Kingdom, WC2H 7BP","denominations":[],"events":[],"groupName":"Catholic","hash":"ef0e9b8b6b06ac183a1408bcd1d997d0062d16e5","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Notre Dame de France","geo":{"@type":"GeoCoordinates","latitude":51.5109632,"longitude":-0.1302443},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"WC2H 7BP","streetAddress":"Leicester Place"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/notre-dame-de-france"},"location":{"type":"Point","coordinates":[-0.1302443,51.5109632]},"name":"Notre Dame de France","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/notre-dame-de-france","distance":437.4522716903821},
							{"_id":"56c635948a8e8be0c0c0bcdf","address":{"line1":"Maiden Lane","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"WC2E 7NA"},"averageRating":0,"concatenatedAddress":"Maiden Lane, London, Greater London, United Kingdom, WC2E 7NA","denominations":[],"events":[],"groupName":"Catholic","hash":"691d7398e0c7667a15494c0406066014b6b666d6","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Corpus Christi","geo":{"@type":"GeoCoordinates","latitude":51.5106625,"longitude":-0.1232665},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"WC2E 7NA","streetAddress":"Maiden Lane"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/corpus-christi"},"location":{"type":"Point","coordinates":[-0.1232665,51.5106625]},"name":"Corpus Christi","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/corpus-christi","distance":482.4410491157676},
							{"_id":"56c635958a8e8be0c0c0e4bc","address":{"line1":"13 Poland Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W1F 8QB"},"averageRating":0,"concatenatedAddress":"13 Poland Street, London, Greater London, United Kingdom, W1F 8QB","denominations":[],"events":[],"groupName":"Catholic","hash":"2a7917bc777e2e8cd146a370494d5a3e6f530b8a","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Holy Brother Albert","geo":{"@type":"GeoCoordinates","latitude":51.51461399999999,"longitude":-0.1368965},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W1F 8QB","streetAddress":"13 Poland Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/holy-brother-albert"},"location":{"type":"Point","coordinates":[-0.1368965,51.51461399999999]},"name":"Holy Brother Albert","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/holy-brother-albert","distance":1026.8999961078707},
							{"_id":"56c635948a8e8be0c0c0bd1c","address":{"line1":"70 Lincoln's Inn Fields","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"WC2A 3JA"},"averageRating":0,"concatenatedAddress":"70 Lincoln's Inn Fields, London, Greater London, United Kingdom, WC2A 3JA","denominations":[],"events":[],"groupName":"Catholic","hash":"c3e4f9a02f7eb0600ba293cb16e0efa1f8f7455b","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Anselm and St Cecilia","geo":{"@type":"GeoCoordinates","latitude":51.5167207,"longitude":-0.1189408},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"WC2A 3JA","streetAddress":"70 Lincoln's Inn Fields"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-anselm-and-st-cecilia"},"location":{"type":"Point","coordinates":[-0.1189408,51.5167207]},"name":"St. Anselm and St Cecilia","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-anselm-and-st-cecilia","distance":1208.753566687858},
							{"_id":"56c635918a8e8be0c0bfcc02","address":{"line1":"Westminster Community Church, 2 Greycoat Place","line2":"","locality":"London","region":"London","country":"England","postalCode":"SW1P 1SB"},"averageRating":0,"concatenatedAddress":"Westminster Community Church, 2 Greycoat Place, London, London, England, SW1P 1SB","denominations":[],"events":[],"groupName":"RCCG","hash":"38e79324ef90761517f3dbd4595a1dda2921f642","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Shekhinah Glory Of The Living God","geo":{"@type":"GeoCoordinates","latitude":51.4966083,"longitude":-0.1339058},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"London","addressRegion":"London","postalCode":"SW1P 1SB","streetAddress":"Westminster Community Church, 2 Greycoat Place"},"mainentityofpage":"https://opendoor.ooo/places/england/london/london/christianity/rccg/shekhinah-glory-of-the-living-god"},"location":{"type":"Point","coordinates":[-0.1339058,51.4966083]},"name":"Shekhinah Glory Of The Living God","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/london/christianity/rccg/shekhinah-glory-of-the-living-god","distance":1269.461545619689},
							{"_id":"56c635918a8e8be0c0bfcc84","address":{"line1":"106 Doreen Ramsey Court, The Cut","line2":"","locality":"London","region":"Greater London","country":"England","postalCode":"SE1 8LN"},"averageRating":0,"concatenatedAddress":"106 Doreen Ramsey Court, The Cut, London, Greater London, England, SE1 8LN","denominations":[],"events":[],"groupName":"RCCG","hash":"a861674e75441e7d9f3f3a9c08c5271e97c78231","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Zion Assembly Elephant & Castle","geo":{"@type":"GeoCoordinates","latitude":51.5022931,"longitude":-0.1096526},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"London","addressRegion":"Greater London","postalCode":"SE1 8LN","streetAddress":"106 Doreen Ramsey Court, The Cut"},"mainentityofpage":"https://opendoor.ooo/places/england/greater-london/london/christianity/rccg/zion-assembly-elephant-castle"},"location":{"type":"Point","coordinates":[-0.1096526,51.5022931]},"name":"Zion Assembly Elephant & Castle","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/greater-london/london/christianity/rccg/zion-assembly-elephant-castle","distance":1375.097885471472},
							{"_id":"56c635948a8e8be0c0c0bd65","address":{"line1":"114 Mount Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W1K 3AH"},"averageRating":0,"concatenatedAddress":"114 Mount Street, London, Greater London, United Kingdom, W1K 3AH","denominations":[],"events":[],"groupName":"Catholic","hash":"8d9a857866e4aa95a3d575a1f54d9108dd8a5792","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"The Immaculate Conception","geo":{"@type":"GeoCoordinates","latitude":51.50986,"longitude":-0.1489946},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W1K 3AH","streetAddress":"114 Mount Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/the-immaculate-conception"},"location":{"type":"Point","coordinates":[-0.1489946,51.50986]},"name":"The Immaculate Conception","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/the-immaculate-conception","distance":1497.6234460374535},
							{"_id":"56c635948a8e8be0c0c0bce5","address":{"line1":"114 Mount Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W1K 3AH"},"averageRating":0,"concatenatedAddress":"114 Mount Street, London, Greater London, United Kingdom, W1K 3AH","denominations":[],"events":[],"groupName":"Catholic","hash":"7062b6814d76c135f29bf37b3753659877079ccc","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Immaculate Conception","geo":{"@type":"GeoCoordinates","latitude":51.50986,"longitude":-0.1489946},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W1K 3AH","streetAddress":"114 Mount Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/immaculate-conception"},"location":{"type":"Point","coordinates":[-0.1489946,51.50986]},"name":"Immaculate Conception","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/immaculate-conception","distance":1497.6234460374535},
							{"_id":"56c635948a8e8be0c0c0bcd6","address":{"line1":"Ambrosden Avenue","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"SW1P"},"averageRating":0,"concatenatedAddress":"Ambrosden Avenue, London, Greater London, United Kingdom, SW1P","denominations":[],"events":[],"groupName":"Catholic","hash":"8279cc5a61157dd97d6ad0c154d50f498c643d28","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Archdiocese of Westminster","geo":{"@type":"GeoCoordinates","latitude":51.4957943,"longitude":-0.1388978},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"SW1P","streetAddress":"Ambrosden Avenue"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/archdiocese-of-westminster"},"location":{"type":"Point","coordinates":[-0.1388978,51.4957943]},"name":"Archdiocese of Westminster","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/archdiocese-of-westminster","distance":1500.2831850472398},
							{"_id":"56c635918a8e8be0c0bfcb4c","address":{"line1":"Doggett’S House, Blackfrairs Bridge","line2":"","locality":"Greater London","region":"Greater London","country":"England","postalCode":"SE1 9UD"},"averageRating":0,"concatenatedAddress":"Doggett’S House, Blackfrairs Bridge, Greater London, Greater London, England, SE1 9UD","denominations":[],"events":[],"groupName":"RCCG","hash":"d6bbe23f8605707cadda07af48444fc6f119407b","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"King’S Centre Blackfriars","geo":{"@type":"GeoCoordinates","latitude":51.5084515,"longitude":-0.1048548},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"Greater London","addressRegion":"Greater London","postalCode":"SE1 9UD","streetAddress":"Doggett’S House, Blackfrairs Bridge"},"mainentityofpage":"https://opendoor.ooo/places/england/greater-london/greater-london/christianity/rccg/kings-centre-blackfriars"},"location":{"type":"Point","coordinates":[-0.1048548,51.5084515]},"name":"King’S Centre Blackfriars","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/greater-london/greater-london/christianity/rccg/kings-centre-blackfriars","distance":1591.6051793595184},
							{"_id":"56c635918a8e8be0c0bfcbb4","address":{"line1":"Doggett Coats And Badge, 1 Blackfriars Road","line2":"","locality":"Waterloo","region":"London","country":"England","postalCode":"SE1 9UD"},"averageRating":0,"concatenatedAddress":"Doggett Coats And Badge, 1 Blackfriars Road, Waterloo, London, England, SE1 9UD","denominations":[],"events":[],"groupName":"RCCG","hash":"5ae9d87dfee9e1a2d15b71373ae2d9d16f62ccc1","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Our God Reigns Waterloo","geo":{"@type":"GeoCoordinates","latitude":51.5084515,"longitude":-0.1048548},"address":{"@type":"PostalAddress","addressCountry":"England","addressLocality":"Waterloo","addressRegion":"London","postalCode":"SE1 9UD","streetAddress":"Doggett Coats And Badge, 1 Blackfriars Road"},"mainentityofpage":"https://opendoor.ooo/places/england/london/waterloo/christianity/rccg/our-god-reigns-waterloo"},"location":{"type":"Point","coordinates":[-0.1048548,51.5084515]},"name":"Our God Reigns Waterloo","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"england/london/waterloo/christianity/rccg/our-god-reigns-waterloo","distance":1591.6051793595184},
							{"_id":"56c635948a8e8be0c0c0bd22","address":{"line1":"8 Ogle Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W1W 6HS"},"averageRating":0,"concatenatedAddress":"8 Ogle Street, London, Greater London, United Kingdom, W1W 6HS","denominations":[],"events":[],"groupName":"Catholic","hash":"a0d6a629146eefd4ad791c20e73f5783102d0932","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Charles Borromeo","geo":{"@type":"GeoCoordinates","latitude":51.52012879999999,"longitude":-0.1400982},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W1W 6HS","streetAddress":"8 Ogle Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-charles-borromeo"},"location":{"type":"Point","coordinates":[-0.1400982,51.52012879999999]},"name":"St. Charles Borromeo","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-charles-borromeo","distance":1659.5422749367965},
							{"_id":"56c635948a8e8be0c0c0bc93","address":{"line1":"150 Saint George's Road","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"SE1 6HX"},"averageRating":0,"concatenatedAddress":"150 Saint George's Road, London, Greater London, United Kingdom, SE1 6HX","denominations":[],"events":[],"groupName":"Catholic","hash":"9fd54eedebe979f24c510a7d122ae9f2e9104ca8","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Archdiocese of Southwark","geo":{"@type":"GeoCoordinates","latitude":51.498146,"longitude":-0.1087254},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"SE1 6HX","streetAddress":"150 Saint George's Road"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/archdiocese-of-southwark"},"location":{"type":"Point","coordinates":[-0.1087254,51.498146]},"name":"Archdiocese of Southwark","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/archdiocese-of-southwark","distance":1670.1332456773725},
							{"_id":"56c635948a8e8be0c0c0adb2","address":{"line1":"22 Binney Street","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"W1K 5BH"},"averageRating":0,"concatenatedAddress":"22 Binney Street, London, Greater London, United Kingdom, W1K 5BH","denominations":[],"events":[],"groupName":"Catholic","hash":"ecb5ba4662341e9bd8593dfbdc861e45ba2d3be7","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"Great Britain, Faithful of Eastern Rite","geo":{"@type":"GeoCoordinates","latitude":51.5136901,"longitude":-0.1506435},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"W1K 5BH","streetAddress":"22 Binney Street"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/great-britain-faithful-of-eastern-rite"},"location":{"type":"Point","coordinates":[-0.1506435,51.5136901]},"name":"Great Britain, Faithful of Eastern Rite","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/great-britain-faithful-of-eastern-rite","distance":1735.4706841764803},
							{"_id":"56c635948a8e8be0c0c0bd27","address":{"line1":"14 Ely Place","line2":"","locality":"London","region":"Greater London","country":"United Kingdom","postalCode":"EC1N 6RY"},"averageRating":0,"concatenatedAddress":"14 Ely Place, London, Greater London, United Kingdom, EC1N 6RY","denominations":[],"events":[],"groupName":"Catholic","hash":"8f953ba6bf1900ba66ac01d3cc7cb456b73421ec","isConfirmed":true,"jobs":[],"jsonLd":{"@type":"Place","name":"St. Etheldreda","geo":{"@type":"GeoCoordinates","latitude":51.5183761,"longitude":-0.1070299},"address":{"@type":"PostalAddress","addressCountry":"United Kingdom","addressLocality":"London","addressRegion":"Greater London","postalCode":"EC1N 6RY","streetAddress":"14 Ely Place"},"mainentityofpage":"https://opendoor.ooo/places/united-kingdom/greater-london/london/christianity/catholic/st-etheldreda"},"location":{"type":"Point","coordinates":[-0.1070299,51.5183761]},"name":"St. Etheldreda","promotions":[],"ratingsCount":0,"religion":"Christianity","reviews":[],"uri":"united-kingdom/greater-london/london/christianity/catholic/st-etheldreda","distance":1889.036368077691}
						],
						"count":15}
					};*/
					//////////////////////
					if (typeof response.data !== 'object' &&
							!Array.isArray(response.data.results)) {
						return onError();
					}

					var places = roundPlacesDistance(response.data.results);
					var lat = response.data.lat;
					var lng = response.data.lng;

					cb(places, lat, lng);
				}, onError);
			}

			function searchPlacesByIp(cb) {
				searchPlaces({maxDistance: 10000}, cb);
			}

			function updateScopeProperties(places) {
				$scope.places = places;
				$scope.message = places.length ? '' : 'There are no places of worship found near this location.';
				$scope.address = $rootScope.lastSearchAddress || document.forms.form.location.value;
			}

			function setUrlParams() {
				var location = document.forms.form.location.value.split(', ');

				if (location.length < 2) return;

				var lat = location[1];
				var lng = location[0];

				$location.search('lat', lat || null);
				$location.search('lng', lng || null);

				$rootScope.lastSearchAddress = $scope.address;
			}

			function createMap() {
				$rootScope.getMapInstance($('#results-map')).then(function(mapInstance) {
					map = mapInstance;

					addUserLocationMarker();
					addPlacesMarkers();
					setMapBounds();
					configureAutoUploadMap();
				});
			}

			function configureAutoUploadMap() {
				var timerId;

				google.maps.event.addListener(map, 'dragstart', function() {
					console.log('dragstart');
					clearTimeout(timerId);

					google.maps.event.addListenerOnce(map, 'dragend', function() {
						console.log('dragend');

						timerId = setTimeout(function() {
							console.log('timeout');

							var mapCenterLatLng = map.getCenter();
							var mapCenterLat = mapCenterLatLng.lat();
							var mapCenterLng = mapCenterLatLng.lng();

							searchPlaces({
								lat: mapCenterLat,
								lng: mapCenterLng,
								maxDistance: 5000
							}, function(places) {
								saveLatLng(mapCenterLat, mapCenterLng);

								updateScopeProperties(places);

								map.removeMarkers();
								map.removeInfoWindows();

								addUserLocationMarker();
								addPlacesMarkers();
								setMapBounds();
							});
						}, 700);
					});
				});
			}

			function addUserLocationMarker() {
				var location = document.forms.form.location.value.split(', ');

				map.addMarker({
					map: map,
					title: USERMARKERTITLE,
					icon: map.icons.location,
					position: new google.maps.LatLng(location[1], location[0])
				});
			}

			function addPlacesMarkers() {
				$scope.places.forEach(function(place, i) {
					var markerPosition = new google.maps.LatLng(
						place.location.coordinates[1],
						place.location.coordinates[0]
					);

					var marker = map.addMarker({
						map: map,
						title: place.name,
						position: markerPosition,
						icon: map.icons.brightPoi
					});

					setMarkerMouseEventsHandlers(marker, i);
				});

				function setMarkerMouseEventsHandlers(marker, i) {
					google.maps.event.addListener(marker, 'mouseover', function() {
						marker.setIcon(map.icons.defaultPoi);
						$('tr:nth-child(' + (i + 1) + ')', $table).addClass('hover');
					});
					google.maps.event.addListener(marker, 'mouseout', function() {
						marker.setIcon(map.icons.brightPoi);
						$('tr:nth-child(' + (i + 1) + ')', $table).removeClass('hover');
					});
				}
			}

			function setMapBounds() {
				if (map.markers.length === 1) {
					map.setCenter(map.markers[0].position);
					map.setZoom(12);
				} else {
					var bounds = new google.maps.LatLngBounds();
					var userMarkerLatLng = map.markers.filter(function(m) {
							return m.title === USERMARKERTITLE;
						})[0].getPosition();

					map.markers.forEach(function(marker) {
						if (marker.title === USERMARKERTITLE) return;

						var markerLatLng = marker.getPosition();
						var mirroredPos = getMirroredPosition(markerLatLng, userMarkerLatLng);

						bounds.extend(markerLatLng);
						bounds.extend(mirroredPos);
					});

					map.fitBounds(bounds);
				}
			}

			function saveLatLngInCookies(lat, lng) {
				$cookies.put('latitude', lat);
				$cookies.put('longitude', lng);
			}

			function mouseOut(i) {
				map.markers[i + 1].setIcon(map.icons.brightPoi);
			}

			function mouseOver(i) {
				map.markers[i + 1].setIcon(map.icons.defaultPoi);
			}

			function roundPlacesDistance(places) {
				for (var i = places.length - 1; i >= 0; i--) {
					places[i].distance = Math.round(places[i].distance);
				}

				return places;
			}

			function getMirroredPosition(p, o) {
				p = [p.lng(), p.lat()];
				o = [o.lng(), o.lat()];

				var px = p[0];
				var py = p[1];
				var ox = o[0];
				var oy = o[1];

				return new google.maps.LatLng((oy * 2 - py), (ox * 2 - px));
			}

			function isValidLatitude(lat) {
				return lat !== null && isFinite(lat) && Math.abs(lat) <= 90;
			}

			function isValidLongitude(lng) {
				return lng !== null && isFinite(lng) && Math.abs(lng) <= 180;
			}

			function onError(msg) {
				console.log('onError');
				$scope.searchComplete = true;
				$scope.message = msg || 'Occur error during request!';
				$scope.places = null;
			}
		}
	]);
});