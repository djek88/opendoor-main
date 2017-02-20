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
					updateScopeProperties(places);

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
				searchPlaces({byIp: true, maxDistance: 10000}, cb);
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
								maxDistance: 10000
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