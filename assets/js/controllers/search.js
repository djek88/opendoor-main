/**
 * Created by vavooon on 24.03.16.
 */

define(['angular', 'app', 'locationpicker'], function(angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('SearchCtrl', ['$scope', '$http', '$rootScope', '$location',
		function($scope, $http, $rootScope, $location) {
			console.log('tic', $scope.userIp);

			var map;
			var $locationInputEl = $('.location-picker-address');
			var reqParams = $location.search();
			var $table = $('#search-table');

			//$scope.ft = 1;
			$scope.places = null;
			$scope.message = 'Getting Your Current Location';
			//$scope.religionsList = $rootScope.religions;
			$scope.religion = '';

			$scope.mouseOver = mouseOver;
			$scope.mouseOut = mouseOut;
			$scope.searchPlaces = searchPlaces;

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
			} else {
				searchPlacesByIp(onLocationDetectComplete);
			}

			/*$(".location-picker-location").change(function() {
				console.log('location-picker-location CHANGE', $scope.ft);

				if ($scope.ft == 1 && $.isEmptyObject(reqParams)) {
					autoSearchPlaces();
					$scope.address = '';
				}

				$scope.ft = 2;
			});*/

			function searchPlaces() {
				console.log('searchPlaces');
				/*$scope.form.$submitted = true;

				if ($locationInputEl.attr('active') == '1') {
					$locationInputEl.one('change', setSearchParams);
				} else {
					setSearchParams();
				}*/

				$scope.lat = reqParams.lat;
				$scope.lng = reqParams.lng;
				$scope.location = reqParams.lng + ', ' + reqParams.lat;
				$scope.address = $rootScope.lastSearchAddress || $scope.location;
				$scope.religion = reqParams.religion;
				$scope.message = 'Searching…';
				reqParams.maxDistance = 15000;

				$http({
					url: '/ajax/places/search',
					method: 'GET',
					params: reqParams,
				}).then(displayResults, onError);
			}

			function searchPlacesByIp(cb) {
				var prom = $http({
					url: '/ajax/places/search',
					method: 'GET'
				});
				prom.then(cb);
				prom.then(displayResults, onError);
			}

			function setSearchParams() {
				console.log('setSearchParams');
				var location = document.forms.form.location.value.split(', ');

				if (location.length == 2) {
					var reqParams = {
						lat: location[1],
						lng: location[0],
						religion: $scope.religion
					};

					$location.search('lat', reqParams.lat || null);
					$location.search('lng', reqParams.lng || null);
					$location.search('religion', reqParams.religion || null);
					$rootScope.lastSearchAddress = $scope.address;
				}
			}

			/*function autoSearchPlaces() {
				console.log('autoSearchPlaces');

				if ($locationInputEl.attr('active') == '1') {
					$locationInputEl.one('change', setSearchParams);
				} else {
					setSearchParams();
				}

				$scope.lat = reqParams.lat;
				$scope.lng = reqParams.lng;
				$scope.location = reqParams.lng + ', ' + reqParams.lat;
				$scope.address = $rootScope.lastSearchAddress || $scope.location;
				$scope.religion = reqParams.religion;
				$scope.message = 'Searching…';
				reqParams.maxDistance = 15000;

				$http({
					url: '/ajax/places/search',
					method: 'GET',
					params: reqParams,
				}).success(displayResults).error(onError);
			}*/

			function displayResults(response) {
				response = response.data;

				if (typeof response != 'object' && !Array.isArray(response.results)) {
					return onError();
				}

				var places = response.results;

				if (response.lat && response.lng) {
					$scope.location = response.lng + ', ' + response.lat;
				}

				if (!places.length) {
					$scope.message = 'There are no places of worship found near this location';
				} else {
					for (var i = 0; i < places.length; i++) {
						places[i].distance = Math.round(places[i].distance);
					}
					$scope.message = '';
				}

				$scope.places = places;
				createMap();
			}

			function createMap() {
				console.log('createMap');
				if ($scope.message.length) return;

				$rootScope.getMapInstance($('#results-map')).then(function(m) {
					map = m;

					google.maps.event.addListenerOnce(map, 'idle', function() {
						addMarkers($scope.places);
					});

					addMarkers($scope.places);
				});
			}

			function addMarkers(data) {
				console.log('addMarkers');
				var bounds = new google.maps.LatLngBounds();
				var location = $scope.location.split(', ');
				map.removeMarkers();
				map.markers.push(new google.maps.Marker({
					position: {lat: parseFloat(location[1]), lng: parseFloat(location[0])},
					map: map,
					icon: map.icons.location,
					title: 'My location'
				}));

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

					setMarketMouseEventsHandlers(marker, i);
				}

				google.maps.event.trigger(map, 'resize');
				map.fitBounds(bounds);

				function setMarketMouseEventsHandlers(marker, i) {
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
				$scope.searchComplete = true;////////////////////////////////////////////////////////////////////////
			}

			function mouseOut(i) {
				console.log('mouseOut');
				map.markers[i + 1].setIcon(map.icons.brightPoi);
			}

			function mouseOver(i) {
				console.log('mouseOver');
				map.markers[i + 1].setIcon(map.icons.defaultPoi);
			}

			function mirrorPoint(p, o) {
				console.log('mirrorPoint');
				var px = p[0];
				var py = p[1];
				var ox = o[0];
				var oy = o[1];
				return [ox * 2 - px, oy * 2 - py];
			}

			function isValidLatitude(lat) {
				console.log('isValidLatitude');
				return isFinite(lat) && Math.abs(lat) <= 90;
			}

			function isValidLongitude(lng) {
				console.log('isValidLongitude');
				return isFinite(lng) && Math.abs(lng) <= 180;
			}

			function onError(msg) {
				console.log('onError');
				$scope.message = msg || 'Occur error during request!';
				//$scope.address = '';
				$scope.places = null;
			}
		}
	]);
});