/**
 * Created by vavooon on 29.03.16.
 */
define(['angular'
	, 'app'
	, 'libs/googlemaps'
	, 'libs/datetimepicker'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('EventAddCtrl', ['$scope', '$rootScope', '$location', '$http',
		function ($scope, $rootScope, $location, $http) {
			var geocoder = new google.maps.Geocoder();
			var map = $rootScope.getMapInstance($('#results-map'));
			var $datetimepicker = $('#datetimepicker');
			var $locationEl = $('[name="location"]');
			$datetimepicker.datetimepicker();
			$datetimepicker.on('dp.change', function () {
				$scope.date = $('input', $datetimepicker).val();
			});
			$rootScope.getMapInstance($('#results-map'))
				.then(function(m) {
					map = m;
					google.maps.event.addListenerOnce(map, 'idle', function () {
						google.maps.event.trigger(map, 'resize');
					});


					var pos = new google.maps.LatLng(0, 0);
					map.setCenter(pos);
					map.setZoom(2);
				});

			$scope.searchByAddress = function () {
				geocoder.geocode({'address': $scope.address}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						map.removeMarkers();
						if (results.length) {
							var firstResult = results[0];
							$locationEl.val([firstResult.geometry.location.lng(), firstResult.geometry.location.lat()].join(', '));
							$locationEl.trigger('change');
							map.setMarker([firstResult.geometry.location.lng(), firstResult.geometry.location.lat()], firstResult.geometry.bounds);
						}
					}
				});
			};


			var locationParts = $location.url().split('/');
			var placeId = locationParts[locationParts.length - 2];
			$scope.placeId = placeId;


			function setData($place) {

				$scope.place = $place;
				$scope.address = $place.concatenatedAddress;
				$scope.location = $place.location.coordinates.join(', ');
				$locationEl.val($scope.location);
				map.setMarker([$place.location.coordinates[0], $place.location.coordinates[1]]);
			}

			if ($rootScope.selectedPlace) {
				setData($rootScope.selectedPlace);
			}
			else {
				$http({
					url: '/ajax/places/' + placeId
					, method: 'GET'
				}).success(function (data) {
					if (typeof data == 'object') {
						setData(data);
					}
					else {
						$location.url('/notfound');
					}
				}).error(function () {
					$location.url('/notfound');
				});
			}
		}
	]);
});