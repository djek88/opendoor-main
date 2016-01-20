/**
 *
 * Created by Vavooon on 17.12.2015.
 */




var opendoorControllers = angular.module('opendoorControllers', []);


opendoorControllers.controller('LoginCtrl', ['$scope', '$location',
	function($scope, $location) {
		switch ($location.search()['message']) {
			case 'regsuccess':
				$scope.$alertType = 'success';
				$scope.$alertMessage = 'Registration was successful. Please log in using your login and password';
			break;
			case 'wrongloginorpassword':
				$scope.$alertType = 'danger';
				$scope.$alertMessage = 'You have entered an invalid username or password';
			break;
		}
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				document.forms.form.submit();
			}
		};
	}
]);

opendoorControllers.controller('RegisterCtrl', ['$scope', '$location',
	function($scope, $location) {
		switch ($location.search()['message']) {
			case 'alreadyregistered':
				$scope.$alertType = 'danger';
				$scope.$alertMessage = 'Your email already exists in our database. Please try to restore your password';
				break;
		}
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				document.forms.form.submit();
			}
		};
	}
]);


opendoorControllers.controller('PlaceViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll',
	function($scope, $rootScope, $location, $http, $cookies, $anchorScroll) {
		var placeId = $location.url().split('/').pop();
		$scope.$placeId = placeId;
		var userPosition = 0;
		var map;

		$scope.scrollTo = function(id) {
			$anchorScroll(id);
			//$location.hash(id);
		};

		function addUserPositionMarker() {
			map.addMarker({
					position: {lat: userPosition.latitude, lng: userPosition.longitude}
				,	icon: '/assets/img/mylocation.png'
				,	title: 'My location'
			});
		}

		$scope.$onLeaderPhotoLoad = function() {
			$el = $('.leader-photo');
			if ($el.width() > $el.height()) {
				$el.removeClass('portrait');
			}
			else {
				$el.addClass('portrait');
			}
		};

		function showNearbyPlaces(place){
			var requestParams = {
				lat: place.location.coordinates[0]
				, lng: place.location.coordinates[1]
				, religion: place.religion
			};

			$http({
				url: '/ajax/places/search'
				, method: 'GET'
				, params: requestParams
			}).
			success(function (places){
				var nearbyPlaces = [];
				if (Array.isArray(places)) {
					if (places.length) {
						var placesCount = places.length;
						if (placesCount>5) {
							placesCount=5;
						}
						for (var i = 0; i < placesCount; i++) {
							if (places[i]._id != $scope.$place._id){
								places[i].distance = Math.round(places[i].distance);
								nearbyPlaces.push(places[i]);
							}
						}
						$scope.$nearbyPlacesMessage = '';
					}
					else {
						$scope.$nearbyPlacesMessage = 'There are no places nearby';
					}
					$scope.$nearbyPlaces = nearbyPlaces;
				}
				else {
					$scope.$nearbyPlacesMessage = 'An error happened during request';
				}
				$scope.$nearbyPlaces = nearbyPlaces;
			}).
			error(function () {
			});
		}


		function setData($place) {
			$scope.$isMaintainer = $place.maintainer && $place.maintainer._id && $place.maintainer._id == $rootScope.$_id;
			if ($place.updatedAt) {
				$place.updatedAt = (new Date($place.updatedAt)).toString('dd.MM.yyyy');
			}

			if (typeof $place.homepage == 'string' && $place.homepage) {
				if ($place.homepage.substr(0, 4) != 'http') {
					$place.homepage = 'http://' + $place.homepage;
				}
			}

			$scope.$mainMeetingText = '';
			if ($place.mainMeetingTime || $place.mainMeetingDay) {
				$scope.$mainMeetingText += 'Main service ';
				if ($place.mainMeetingTime) {
					$scope.$mainMeetingText += (new Date($place.mainMeetingTime)).toString('HH:mm') + ' ';
				}
				if ($place.mainMeetingDay) {
					$scope.$mainMeetingText += 'every ' + $place.mainMeetingDay;
				}
			}

			$scope.$place = $place;


			map = $rootScope.$getMapInstance($('#results-map'));
			google.maps.event.trigger(map, 'resize');
			var pos = new google.maps.LatLng($place.location.coordinates[0], $place.location.coordinates[1]);
			map.setCenter(pos);
			map.setZoom(16);
			map.addMarker({
					position: pos
				,	icon: '/assets/img/spotlight-poi.png'
				,	title: $place.name
			});
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(location) {
					$scope.$apply(function(){
						userPosition = {latitude: location.coords.latitude, longitude: location.coords.longitude};
						addUserPositionMarker();
					});
				});
			}
		}
		if ($rootScope.$selectedPlace) {
			setData($rootScope.$selectedPlace);
			showNearbyPlaces($rootScope.$selectedPlace);
		}
		else {
			var id = $location.url().split('/').pop();
			$http({
					url: '/ajax/places/' + id
				, method: 'GET'
			}).
			success(function (data) {
				if (typeof data== 'object') {
					setData(data);
					showNearbyPlaces(data);
				}
				else {
					$location.url('/notfound');
				}
			}).
			error(function () {
				$location.url('/notfound');
			});
		}




	}
]);

opendoorControllers.controller('PlaceFormCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {

		var geocoder = new google.maps.Geocoder();
		var denominations = [];
		var groups;
		var $denominationsEl = $('input[name="denominations"]');
		var $groupsEl = $('select[name="groupName"]');
		var $religionEl = $('select[name="religion"]');
		var $newReligionGroupOption;


		var placeId = $location.url().split('/').pop();

		if (placeId == 'add') {
			placeId = 0;
		}
		else {
			$scope.$submitPath = '/places/edit/' + placeId;
			$scope.$additionalFieldsAreVisible = true;
		}
		var map = $rootScope.$getMapInstance($('#results-map'));

		google.maps.event.addListenerOnce(map, 'idle', function(){
			google.maps.event.trigger(map, 'resize');
		});


		var pos = new google.maps.LatLng(0,0);
		map.setCenter(pos);
		map.setZoom(2);

		$('.timepicker-input').timepicker({showMeridian: false, defaultTime: false});
		$('.location-picker').locationpicker();



		$denominationsEl.tagit({
				availableTags: denominations
			,	autocomplete: {
						delay: 0
				}
		});

		$scope.$religions = $rootScope.$religions;
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				document.forms.form.submit();
			}
		};

		$groupsEl.selectpicker({
			style: 'form-control btn-white',
			liveSearch: true
		});
		var $bsSearchbox = $('.bs-searchbox input');
		$bsSearchbox.on('input', function(){
			var value = $bsSearchbox.val();
			if ($newReligionGroupOption) {
				$newReligionGroupOption.detach();
			}
			if (value) {
				var regExp = new RegExp(".*" + RegExp.escape(value) + ".*");
				var matchesWasFound = false;
				for (var i = 0; i<groups.length; i++) {
					if (regExp.test(groups[i])) {
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

		function setMarker(location, bounds) {
			if (bounds) {
				map.fitBounds(bounds);
			}
			else {
				map.setZoom(16);
			}
			var pos = new google.maps.LatLng(location[0], location[1]);
			map.addMarker({
				position: pos
				,	map: map
				,	icon: map.icons.defaultPoi
			});
			map.setCenter(pos);
		}

		$scope.$searchByAddress = function() {
			var concatenatedAddress = [
				$scope.$place.address.line1
				, $scope.$place.address.line2
				, $scope.$place.address.city
				, $scope.$place.address.region
				, $scope.$place.address.country
				, $scope.$place.address.postalCode
			].cleanArray().join(', ');
			geocoder.geocode({'address': concatenatedAddress}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					map.removeMarkers();
					if (results.length) {
						var firstResult = results[0];
						var $locationEl = $('[name="location"]');
						$locationEl.val([firstResult.geometry.location.lat(), firstResult.geometry.location.lng()].join(', '));
						$locationEl.trigger('change');
						setMarker([firstResult.geometry.location.lat(), firstResult.geometry.location.lng()], firstResult.geometry.bounds);
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
			}).
			success(function (data){
				$groupsEl.empty();
				groups = data;
				for (var i=0; i<data.length; i++) {
					$groupsEl.append('<option value="' + data[i].name + '">' + data[i].name + '</option>');
				}
				$groupsEl.selectpicker('refresh');
				$groupsEl.selectpicker('val', $scope.$place.groupName);
			});


			$http({
				url: '/ajax/denominations'
				, method: 'GET'
				, params: {
					religion: religion
				}
			}).
			success(function (data){
				$denominationsEl.tagit('removeAll');
				while (denominations.pop()) {
				}
				for (var i=0; i<data.length; i++) {
					var denomination = data[i].name;
					denominations.push(denomination);
					if ($scope.$place.denominations && $scope.$place.denominations.indexOf(denomination) != -1) {
						$denominationsEl.tagit('createTag', denomination);
					}
				}
			});
		}


		$religionEl.on('change', function(){
			loadOptionsForReligion($religionEl.val());
		});

		$groupsEl.on('change', function(){
			$scope.$place.groupName = $groupsEl.val();
		});


		function setData($place) {
			if ($place.mainMeetingTime){
				var mainMeetingTime = new Date($place.mainMeetingTime);
				$place.mainMeetingTime = mainMeetingTime.toString('HH:mm');
			}

			$scope.$place = $place;

			loadOptionsForReligion($place.religion);
			$groupsEl.selectpicker('val', $place.groupName);
			setMarker($place.location.coordinates);
		}

		if (placeId) {
			$scope.$edit = true;
			$scope.$mode = 'edit';

			if ($rootScope.$selectedPlace) {
				setData($rootScope.$selectedPlace);
			}
			else {
				$http({
					url: '/ajax/places/' + placeId
					, method: 'GET'
				}).
				success(function (data) {
					if (typeof data== 'object') {
						setData(data);
					}
					else {
						$location.url('/notfound');
					}
				}).
				error(function () {
					$location.url('/notfound');
				});
			}
		}
		else {
			$scope.$mode = 'add';
			$scope.$place = {
				address: {}
				,	location: {}
			};
		}
	}
]);


opendoorControllers.controller('FormCtrl', ['$scope',
	function($scope) {
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				document.forms.form.submit();
			}
		};
	}
]);

opendoorControllers.controller('SearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {
		$('.location-picker').locationpicker();

		$scope.$places = [];
		$scope.$message = 'Press "Search" to find nearest places';
		var $table = $('#search-table');
		var map;

		function createMap() {
			if (!$scope.$message.length) {
				map = $rootScope.$getMapInstance($('#results-map'));
				google.maps.event.addListenerOnce(map, 'idle', function(){
					addMarkers($scope.$places);
				});
				addMarkers($scope.$places);
			}
		}

		var mirrorPoint = function(p, o){
			var px = p[0]
				,	py = p[1]
				,	ox = o[0]
				,	oy = o[1];
			return [ox*2 - px, oy*2 - py];
		};

		var addMarkers = function(data) {
			var bounds = new google.maps.LatLngBounds();
			var location = $scope.location.split(', ');

			map.markers.push(new google.maps.Marker({
				position: {lat: parseFloat(location[0]), lng: parseFloat(location[1])}
				,	map: map
				,	icon: map.icons.location
				,	title: 'My location'
			}));

			for (var i=0; i<data.length; i++) {
				var pos = new google.maps.LatLng(data[i].location.coordinates[0], data[i].location.coordinates[1]);

				// I mirror all markers against search position in order to keep it in center of map
				var mirroredPoint = mirrorPoint(data[i].location.coordinates, location);
				var mirroredPos = new google.maps.LatLng(mirroredPoint[0], mirroredPoint[1]);
				var marker = map.addMarker({
						position: pos
					,	map: map
					,	icon: map.icons.defaultPoi
					,	title: data[i].name
				});
				bounds.extend(pos);
				bounds.extend(mirroredPos);

				(function(marker, i) {
					google.maps.event.addListener(marker, 'mouseover', function () {
						marker.setIcon(map.icons.brightPoi);
						$('tr:nth-child(' + (i+1) + ')', $table).addClass('hover');
					});
					google.maps.event.addListener(marker, 'mouseout', function () {
						marker.setIcon(map.icons.defaultPoi);
						$('tr:nth-child(' + (i+1) + ')', $table).removeClass('hover');
					});
				})(marker, i);

			}

			google.maps.event.trigger(map, 'resize');
			map.fitBounds(bounds);
		};

		$scope.$religionsList = $rootScope.$religions;
		$scope.religion = '';

		$scope.$mouseOver = function(i) {
			map.markers[i+1].setIcon(map.icons.brightPoi);
		};
		$scope.$mouseOut = function(i) {
			map.markers[i+1].setIcon(map.icons.defaultPoi);
		};


		$scope.$searchPlaces = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				var location = document.forms.form.location.value.split(', ');
				if (location.length) {

					var requestParams = {
						lat: location[0]
						, lng: location[1]
						, religion: $scope.religion
					};

					$location.search('lat', requestParams.lat);
					$location.search('lng', requestParams.lng);
					$location.search('religion', requestParams.religion);
					$rootScope.$lastSearchAddress = $scope.address;
				}
			}
		};

		function validateCoordinate(val) {
			val = parseFloat(val);
			return (!isNaN(val) && val <= 90 && val >= -90);
		}

		var requestParams = $location.search();
		if (validateCoordinate(requestParams.lat) && validateCoordinate(requestParams.lng)) {
			$scope.location = requestParams.lat + ', ' + requestParams.lng;
			$scope.address = $rootScope.$lastSearchAddress || $scope.location;
			$scope.religion = requestParams.religion;
			$scope.$message = 'Searching…';
			requestParams.maxDistance = 5000;
			$http({
				url: '/ajax/places/search'
				, method: 'GET'
				, params: requestParams
			}).
			success(function (data){
				if (Array.isArray(data)) {
					if (data.length) {
						for (var i = 0; i < data.length; i++) {
							data[i].distance = Math.round(data[i].distance);
						}
						$scope.$message = '';
					}
					else {
						$scope.$message = 'There are no places nearby';
					}
					$scope.$places = data;
				}
				else {
					$scope.$message = 'An error happened during request';
					$scope.$places = [];
					console.error(data);
				}
				createMap();
			}).
			error(function () {
				$scope.$message = 'Error processing request';
			});
		}

	}
]);


opendoorControllers.controller('LastPlacesCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {
		$scope.$places = [];

		$scope.$message = 'Loading…';
		$http({
			url: '/ajax/places/last'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					for (var i = 0; i < data.length; i++) {
						data[i].distance = Math.round(data[i].distance);
					}
					$scope.$message = '';
				}
				else {
					$scope.$message = 'There are no places';
				}
				$scope.$places = data;
			}
			else {
				$scope.$message = 'An error happened during request';
				$scope.$places = [];
			}
		}).
		error(function () {
			$scope.$message = 'Error processing request';
		});
	}


]);


opendoorControllers.controller('MaintainedPlacesCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {
		$scope.$places = [];

		$scope.$message = 'Loading…';
		$http({
			url: '/ajax/places/maintained'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					for (var i = 0; i < data.length; i++) {
						data[i].distance = Math.round(data[i].distance);
					}
					$scope.$message = '';
				}
				else {
					$scope.$message = 'There are no maintained places';
				}
				$scope.$places = data;
			}
			else {
				$scope.$message = 'An error happened during request';
				$scope.$places = [];
			}
		}).
		error(function () {
			$scope.$message = 'Error processing request';
		});
	}


]);


opendoorControllers.controller('PlaceClaimsCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {

		$scope.$message = 'Loading…';
		$http({
				url: '/ajax/claims'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					$scope.$message = '';
				}
				else {
					$scope.$message = 'There are no claims';
				}
				$scope.$claims = data;
			}
			else {
				$scope.$message = 'An error happened during request';
			}
		}).
		error(function () {
			$scope.$message = 'Error processing request';
		});
	}

]);


opendoorControllers.controller('PlaceChangesCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {

		$scope.$message = 'Loading…';
		$http({
			url: '/ajax/placechanges'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					for (var i=0; i < data.length; i++) {
						if (Array.isArray(data[i].value)) {
							data[i].value = data[i].value.join(', ');
						}
					}
					$scope.$message = '';
				}
				else {
					$scope.$message = 'There are no suggested changes';
				}
				$scope.$changes = data;
			}
			else {
				$scope.$message = 'An error happened during request';
			}
		}).
		error(function () {
			$scope.$message = 'Error processing request';
		});
	}

]);

opendoorControllers.controller('FeedbackCtrl', ['$scope', '$rootScope', '$location',
	function($scope, $rootScope, $location) {
		$scope.$targetPage = $location.hash();
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				document.forms.form.submit();
			}
		};
	}
]);


opendoorControllers.controller('FooterCtrl', ['$scope', '$rootScope', '$location', '$window',
	function($scope, $rootScope, $location, $window) {
		var feedbackPage = '/feedback';
		$scope.$leaveFeedback = function($event) {
			var targetPage = feedbackPage + '#' + $location.path();
			if ($event.which == 2) {
				$window.open(targetPage, '_blank');
			}
			else {
				$location.url(targetPage);
			}
		}
	}
]);

opendoorControllers.controller('ErrorCtrl', ['$scope', '$location',
	function($scope, $location) {
		if ($location.path() == '/notfound') {
			var message = 'notfound';
		}
		else {
			var message = $location.search()['message'];
		}
		switch (message) {
			case 'alreadyregistered':
				$scope.$alertType = 'danger';
				$scope.$alertTitle = 'Error';
				$scope.$alertMessage = 'Your email already exists in our database. Please try to restore your password';
			break;
			case 'notfound':
				$scope.$alertType = 'danger';
				$scope.$alertTitle = 'Error';
				$scope.$alertMessage = 'Page not found';
				break;

			case 'messagesent':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Your message has been sent';
				break;
			case 'feedbacksaved':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Your message has been received';
				$scope.$alertMessage = 'Thank you for taking the time to send us feedback. We will reply to you as soon as we can and normally within 24 hours.';
				break;

			case 'changesadded':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Your changes has been added';
				$scope.$alertMessage = 'Please wait until place maintainer accept your changes.';
				break;
			case 'claimadded':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Your claim has been added';
				$scope.$alertMessage = 'Please wait until administrator accept your claim.';
				break;
			case 'changeaccepted':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Change has been accepted';
				break;
			case 'changedenied':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Change has been denied';
				break;
			case 'claimaccepted':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Claim has been accepted';
				break;
			case 'claimdenied':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Claim has been denied';
				break;
			case 'reviewsaved':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Your review has been saved';
				$scope.$alertMessage = 'Thank you for taking the time to place a review.';
				break;
			case 'placeadded':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Place was added successfully. Confirmation link was sent to your mail';
				break;
			case 'placesaved':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Place was saved successfully.';
				break;
			case 'placeconfirmed':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Place was confirmed successfully';
				break;
			case 'placeconfirmationerror':
				$scope.$alertType = 'danger';
				$scope.$alertTitle = 'Error';
				$scope.$alertMessage = 'Error during place confirmation';
				break;
			default:
				$scope.$alertType = 'danger';
				$scope.$alertTitle = 'Error';
				$scope.$alertMessage = 'An unexpected error happened';
			break;
		}
	}
]);
