/**
 * Created by vavooon on 29.03.16.
 */
define([
		'angular'
		, 'app'
		, 'libs/bootstrap'
		, 'libs/googlemaps'
		, 'libs/tagsinput'
		, 'libs/typeahead'
		, 'libs/datetimepicker'
		, 'libs/selectpicker'
		, 'libs/trumbowyg'
		, 'locationpicker'
	], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('PlaceFormCtrl', ['$scope', '$rootScope', '$location', '$http',
		function ($scope, $rootScope, $location, $http) {

			var geocoder = new google.maps.Geocoder();
			var map;
			var denominations = [];
			var groups;
			var $denominationsEl = $('input[name="denominations"]');
			var $groupsEl = $('select[name="groupName"]');
			var $religionEl = $('select[name="religion"]');
			var $newReligionGroupOption;


			var placeId = $location.path().split('/').pop();

			if (placeId == 'add') {
				placeId = 0;
			}
			else {
				$scope.submitPath = '/places/edit/' + placeId;
				$scope.additionalFieldsAreVisible = true;
			}
			$rootScope.getMapInstance($('#results-map'))
				.then(function (m) {
					map = m;

					google.maps.event.addListenerOnce(map, 'idle', function () {
						google.maps.event.trigger(map, 'resize');
					});


					var pos = new google.maps.LatLng(0, 0);
					map.setCenter(pos);
					map.setZoom(2);
				});

			$('.input-group.date').datetimepicker({
				format: siteconfig.l10n.timeFormat
			});
			$('.location-picker').locationpicker();


			$denominationsEl.tagsinput({
				typeahead: {
					source: function (query) {
						var results = [];
						var currentTags = $denominationsEl.val().slice(',');
						for (var i in denominations) {
							if (denominations.hasOwnProperty(i)) {
								if (currentTags.indexOf(denominations[i]) == -1) {
									results.push(denominations[i]);
								}
							}
						}
						return results;
					}
				}
				, freeInput: true
				, tagClass: 'label label-primary'
			});

			$('.bootstrap-tagsinput').addClass('form-control');


			$scope.religions = $rootScope.religions;

			$groupsEl.selectpicker({
				style: 'form-control btn-white',
				liveSearch: true,
				noneSelectedText: ''
			});
			var $bsSearchbox = $('.bs-searchbox input');
			$bsSearchbox.on('input', function () {
				var value = $bsSearchbox.val();
				if ($newReligionGroupOption) {
					$newReligionGroupOption.detach();
				}
				if (value) {
					var regExp = new RegExp(".*" + RegExp.escape(value.toLowerCase()) + ".*");
					var matchesWasFound = false;
					for (var i = 0; i < groups.length; i++) {
						if (typeof groups[i].name == 'string' && regExp.test(groups[i].name.toLowerCase())) {
							matchesWasFound = true;
							break;
						}
					}
					if (!matchesWasFound) {
						$newReligionGroupOption = $('<option value="' + value + '">' + value + '</option>');
						$groupsEl.append($newReligionGroupOption)
					}
				}
				$groupsEl.selectpicker('refresh');
			});


			$scope.searchByAddress = function () {
				var concatenatedAddress = [
					$scope.place.address.line1
					, $scope.place.address.line2
					, $scope.place.address.locality
					, $scope.place.address.region
					, $scope.place.address.country
					, $scope.place.address.postalCode
				].cleanArray().join(', ');
				geocoder.geocode({'address': concatenatedAddress}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						map.removeMarkers();
						if (results.length) {
							var firstResult = results[0];
							var $locationEl = $('[name="location"]');
							$locationEl.val([firstResult.geometry.location.lng(), firstResult.geometry.location.lat()].join(', '));
							$locationEl.trigger('change');
							map.setMarker([firstResult.geometry.location.lng(), firstResult.geometry.location.lat()], firstResult.geometry.bounds);
						}
					}
				});
			};


			function loadOptionsForReligion(religion) {
				$http({
					url: '/ajax/religionGroups'
					, method: 'GET'
					, params: {
						religion: religion
					}
				}).success(function (data) {
					$groupsEl.empty();
					groups = data;
					$groupsEl.append('<option value="" selected disabled></option>');
					for (var i = 0; i < data.length; i++) {
						$groupsEl.append('<option value="' + data[i].name + '">' + data[i].name + '</option>');
					}
					$groupsEl.selectpicker('refresh');
					$groupsEl.selectpicker('val', $scope.place.groupName);
				});


				$http({
					url: '/ajax/denominations'
					, method: 'GET'
					, params: {
						religion: religion
					}
				}).success(function (data) {
					while (denominations.pop()) {
					}
					for (var i = 0; i < data.length; i++) {
						var denomination = data[i].name;
						denominations.push(denomination);
					}
				});
			}


			$religionEl.on('change', function () {
				loadOptionsForReligion($religionEl.val());
			});

			$groupsEl.on('change', function () {
				$scope.place.groupName = $groupsEl.val();
			});


			function setData($place) {
				if ($place.mainMeetingTime) {
					var mainMeetingTime = (new Date($place.mainMeetingTime)); //.browserToUTC();
					$place.mainMeetingTime = mainMeetingTime.toString(siteconfig.l10n.timeFormat);
				}


				$scope.isMaintainer = $place.maintainer && $place.maintainer._id && $place.maintainer._id == $rootScope._id;
				$scope.place = $place;

				loadOptionsForReligion($place.religion);
				$groupsEl.selectpicker('val', $place.groupName);
				$rootScope.getMapInstance($('#results-map'))
					.then(function (map) {
						map.setMarker($place.location.coordinates);
						for (var i = 0; i < $place.denominations.length; i++) {
							$denominationsEl.tagsinput('add', $place.denominations[i]);
						}
					});
			}


			if (placeId) {
				$scope.edit = true;
				$scope.mode = 'edit';

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
			else {
				$scope.edit = false;
				$scope.mode = 'add';
				$scope.place = {
					address: {}
					, location: {}
				};
			}
		}
	]);
});