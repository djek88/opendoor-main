define(['angular', 'app', 'libs/googlemaps', 'libs/datetimepicker'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('EventFormCtrl', ['$scope', '$rootScope', '$location', '$http', '$routeParams',
		function ($scope, $rootScope, $location, $http, $routeParams) {
			var isAdding = $location.path() == '/events/add';
			var eventId = $scope.eventId = $routeParams.id;
			var placeId = $location.search().place;

			var geocoder = new google.maps.Geocoder();
			var map;
			var path;
			var $startDatePicker = $('#startDatePicker');
			var $endDatePicker = $('#endDatePicker');
			var $locationEl = $('[name="location"]');

			$startDatePicker.datetimepicker({
				format: siteconfig.l10n.dateTimeFormatMoment
			});
			$startDatePicker.on('dp.change', function () {
				$scope.event.startDate = $('input', $startDatePicker).val();
			});

			$endDatePicker.datetimepicker({
				format: siteconfig.l10n.dateTimeFormatMoment
			});
			$endDatePicker.on('dp.change', function () {
				$scope.event.endDate = $('input', $endDatePicker).val();
			});

			$rootScope.getMapInstance($('#results-map')).then(function(m) {
				map = m;
				google.maps.event.addListenerOnce(map, 'idle', function () {
					google.maps.event.trigger(map, 'resize');
				});


				var pos = new google.maps.LatLng(0, 0);
				map.setCenter(pos);
				map.setZoom(2);
			});

			$scope.searchByAddress = function () {
				geocoder.geocode({'address': $scope.event.address}, function (results, status) {
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

			function setData(event) {
				if (event.startDate) {
					var startDate = (new Date(event.startDate)); //.browserToUTC();
					event.startDate = startDate.toString(siteconfig.l10n.dateTimeFormat);
				}

				if (event.endDate) {
					var endDate = (new Date(event.endDate)); //.browserToUTC();
					event.endDate = endDate.toString(siteconfig.l10n.dateTimeFormat);
				}
				map.setMarker(event.location.coordinates);
				event.location = event.location.coordinates.join(', ');
				$scope.event = event;
			}

			function setDataFromPlace(place) {
				if (eventId) {
					for (var i=0; i < place.events.length; i++) {
						if (place.events[i]._id == eventId) {
							place.events[i].place = place._id;
							setData(place.events[i]);
							break;
						}
					}
					// $location.url('/notfound');
				} else {
					setData({
						address: place.concatenatedAddress,
						location: place.location,
						place: place._id
					});
				}
			}

			if (!isAdding) {
				$scope.edit = true;
				$scope.mode = 'edit';
				path = '/ajax/places/search?event=' + eventId;
			} else {
				$scope.mode = 'add';
				path = '/ajax/places/' + placeId;

			}

			$http({
				url: path,
				method: 'GET'
			}).success(function (data) {
				if (typeof data == 'object') {
					setDataFromPlace(eventId ? data.results[0] : data);
				} else {
					// $location.url('/notfound');
				}
			}).error(function () {
				// $location.url('/notfound');
			});
		}
	]);
});