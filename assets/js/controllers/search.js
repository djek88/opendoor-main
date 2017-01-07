/**
 * Created by vavooon on 24.03.16.
 */

define(['angular', 'app', 'locationpicker'], function (angular, opendoorApp) {
	'use strict';


	opendoorApp.registerController('SearchCtrl', ['$scope', '$http', '$rootScope', '$location',
		function ($scope, $http, $rootScope, $location) {
			$('.location-picker').locationpicker();
			var $locationInputEl = $('.location-picker-address');

			$scope.places = null;
			$scope.message = 'Press "Search" to find nearest place of worship to you';
			var $table = $('#search-table');
			var map;

			function createMap() {
				if (!$scope.message.length) {
					$rootScope.getMapInstance($('#results-map'))
						.then(function(m){
							map = m;
							google.maps.event.addListenerOnce(map, 'idle', function () {
								addMarkers($scope.places);
							});
							addMarkers($scope.places);
						});
				}
			}

			var mirrorPoint = function (p, o) {
				var px = p[0]
					, py = p[1]
					, ox = o[0]
					, oy = o[1];
				return [ox * 2 - px, oy * 2 - py];
			};

			var addMarkers = function (data) {

				var bounds = new google.maps.LatLngBounds();
				var location = $scope.location.split(', ');
				map.removeMarkers();
				map.markers.push(new google.maps.Marker({
					position: {lat: parseFloat(location[1]), lng: parseFloat(location[0])}
					, map: map
					, icon: map.icons.location
					, title: 'My location'
				}));

				for (var i = 0; i < data.length; i++) {
					var pos = new google.maps.LatLng(data[i].location.coordinates[1], data[i].location.coordinates[0]);

					// I mirror all markers against search position in order to keep it in center of map
					var mirroredPoint = mirrorPoint(data[i].location.coordinates, location);
					var mirroredPos = new google.maps.LatLng(mirroredPoint[1], mirroredPoint[0]);
					var marker = map.addMarker({
						position: pos
						, map: map
						, icon: map.icons.brightPoi
						, title: data[i].name
					});
					bounds.extend(pos);
					bounds.extend(mirroredPos);

					(function (marker, i) {
						google.maps.event.addListener(marker, 'mouseover', function () {
							marker.setIcon(map.icons.defaultPoi);
							$('tr:nth-child(' + (i + 1) + ')', $table).addClass('hover');
						});
						google.maps.event.addListener(marker, 'mouseout', function () {
							marker.setIcon(map.icons.brightPoi);
							$('tr:nth-child(' + (i + 1) + ')', $table).removeClass('hover');
						});
					})(marker, i);

				}

				google.maps.event.trigger(map, 'resize');
				map.fitBounds(bounds);
			};

			$scope.religionsList = $rootScope.religions;
			$scope.religion = '';

			$scope.mouseOver = function (i) {
				map.markers[i + 1].setIcon(map.icons.defaultPoi);
			};
			$scope.mouseOut = function (i) {
				map.markers[i + 1].setIcon(map.icons.brightPoi);
			};


			function setSearchParams() {
				var location = document.forms.form.location.value.split(', ');
				if (location.length == 2) {

					var requestParams = {
						lat: location[1]
						, lng: location[0]
						, religion: $scope.religion
					};

					$location.search('lat', requestParams.lat || null);
					$location.search('lng', requestParams.lng || null);
					$location.search('religion', requestParams.religion || null);
					$rootScope.lastSearchAddress = $scope.address;
				}
			}

			$scope.searchPlaces = function () {
				$scope.form.$submitted = true;
				if ($locationInputEl.attr('active') == '1') {
					$locationInputEl.one('change', setSearchParams);
				}
				else {
					setSearchParams();
				}
			};
			
			$scope.autoSearchPlaces = function () { console.log($locationInputEl);
				if ($locationInputEl.attr('active') == '1') { console.log("1");
					$locationInputEl.one('change', setSearchParams);
				}
				else { console.log("2");
					setSearchParams();
				}
			};

			function validateCoordinate(val) {
				val = parseFloat(val);
				return (!isNaN(val) && val <= 90 && val >= -90);
			}

			function onError() {
				$scope.message = 'An error happened during request';
				$scope.places = null;
			}

			var requestParams = $location.search();
			if (validateCoordinate(requestParams.lat) && validateCoordinate(requestParams.lng)) {
				$scope.lat = requestParams.lat;
				$scope.lng = requestParams.lng;
				$scope.location = requestParams.lng + ', ' + requestParams.lat;
				$scope.address = $rootScope.lastSearchAddress || $scope.location;
				$scope.religion = requestParams.religion;
				$scope.message = 'Searching…';
				requestParams.maxDistance = 5000;
				$http({
					url: '/ajax/places/search'
					, method: 'GET'
					, params: requestParams
				}).success(function (response) {
					if (typeof response == 'object' && Array.isArray(response.results)) {
						var places = response.results;
						if (places.length) {
							for (var i = 0; i < places.length; i++) {
								places[i].distance = Math.round(places[i].distance);
							}
							$scope.message = '';
						}
						else {
							$scope.message = 'There are no places of worship found near this location';
						}
						$scope.places = places;
						createMap();
					}
					else {
						onError();
					}
				}).error(onError);
			}
			setTimeout($scope.autoSearchPlaces,2000);
		}
	]);
});