/**
 *
 * Created by Vavooon on 17.12.2015.
 */




var opendoorControllers = angular.module('opendoorControllers', []);


opendoorControllers.controller('LoginCtrl', ['$scope', '$location',
	function($scope, $location) {
		switch ($location.search()['message']) {
			case 'regsuccess':
				$scope.alertType = 'success';
				$scope.alertMessage = 'Registration was successful. Please log in using your login and password';
			break;
			case 'wrongloginorpassword':
				$scope.alertType = 'danger';
				$scope.alertMessage = 'You have entered an invalid username or password';
			break;
		}
	}
]);

opendoorControllers.controller('RegisterCtrl', ['$scope', '$location',
	function($scope, $location) {
		switch ($location.search()['message']) {
			case 'alreadyregistered':
				$scope.alertType = 'danger';
				$scope.alertMessage = 'Your email already exists in our database. Please try to restore your password';
				break;
		}
	}
]);




opendoorControllers.controller('PlaceViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
	function($scope, $rootScope, $location, $http, $cookies, $anchorScroll, $sce) {
		var placeId = $location.url().substr(8);
		$scope.placeId = placeId;
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

		$scope.onLeaderPhotoLoad = function() {
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
					lat: place.location.coordinates[1]
				, lng: place.location.coordinates[0]
				,	limit: 4
				, exclude: place._id
				//, religion: place.religion
			};

			$http({
				url: '/ajax/places/search'
				, method: 'GET'
				, params: requestParams
			}).
			success(function (response){

				if (typeof response == 'object' && Array.isArray(response.results)) {
					var places = response.results;
					if (places.length) {
						for (var i = 0; i < places.length; i++) {
								places[i].distance = Math.round(places[i].distance);
						}
						$scope.nearbyPlacesMessage = '';
					}
					else {
						$scope.nearbyPlacesMessage = 'There are no places nearby';
					}
					$scope.nearbyPlaces = places;
				}
				else {
					$scope.nearbyPlacesMessage = 'An error happened during request';
					$scope.nearbyPlaces = null;
				}
			}).
			error(function () {
				$scope.nearbyPlacesMessage = 'An error happened during request';
				$scope.nearbyPlaces = null;
			});
		}


		function setData($place) {
			$scope.isMaintainer = $place.maintainer && $place.maintainer._id && $place.maintainer._id == $rootScope._id;
			if ($place.updatedAt) {
				$place.updatedAt = (new Date($place.updatedAt)).toString('dd.MM.yyyy');
			}

			if (typeof $place.homepage == 'string' && $place.homepage) {
				if ($place.homepage.substr(0, 4) != 'http') {
					$place.homepage = 'http://' + $place.homepage;
				}
			}

			if(navigator.userAgent.toLowerCase().indexOf('iphone')!=-1 || navigator.userAgent.toLowerCase().indexOf('ipod')!=-1 || navigator.userAgent.toLowerCase().indexOf("linux") != -1) {
				$place.externalMapsLink = $sce.trustAsResourceUrl('http://maps.apple.com/?ll=' + $place.location.coordinates[1] + ',' + $place.location.coordinates[0] + '&q=' + $place.name);
			}
			else if( navigator.userAgent.toLowerCase().indexOf("android") != -1) {
				$place.externalMapsLink = $sce.trustAsResourceUrl('geo:0,0?q=' + $place.location.coordinates[1] + ',' + $place.location.coordinates[0] + '(' + $place.name + ')');
			}

			if ($place.phone) {
				$place.phoneUrl = $sce.trustAsResourceUrl('tel:' + $place.phone);
			}

			$scope.mainMeetingText = '';
			if ($place.mainMeetingTime || $place.mainMeetingDay) {
				$scope.mainMeetingText += 'Main service ';
				if ($place.mainMeetingTime) {
					$scope.mainMeetingText += (new Date($place.mainMeetingTime)).toString('HH:mm') + ' ';
				}
				if ($place.mainMeetingDay) {
					$scope.mainMeetingText += 'every ' + $place.mainMeetingDay;
				}
			}

			var currentDate = new Date();
			$place.pastEvents = [];
			if ($place.events) {
				for (var i=0; i<$place.events.length; i++) {
					$place.events[i].dateObject = new Date($place.events[i].date);
					$place.events[i].date = (new Date($place.events[i].date)).toString('dd/MM/yyyy HH:mm');
					if ($place.events[i].dateObject<currentDate) {
						$place.pastEvents.push($place.events[i]);
						$place.events.splice(i, 1);
						i--;
						continue;
					}
					if ($place.events[i].dateObject>currentDate && (!$place.nextEvent || $place.events[i].dateObject<$place.nextEvent.dateObject)) {
						$place.nextEvent = $place.events[i];
					}
				}
 			}


			$place.activePromotions = [];
			if ($place.promotions) {
				for (var i=0; i<$place.promotions.length; i++) {
					var promotion = $place.promotions[i];
					promotion.dateObject = new Date(promotion.expireDate);
					if (promotion.dateObject>currentDate) {
						if (promotion.url && promotion.url.substr(0, 4) != 'http') {
							promotion.url = 'http://' + promotion.url;
						}
						$place.activePromotions.push(promotion);
					}
				}
			}


			$place.activeJobs = [];
			if ($place.jobs.length) {
				for (var i = 0; i < $place.jobs.length; i++) {
					$place.jobs[i].expireDate = new Date($place.jobs[i].expireDate);
					$place.jobs[i].action = $sce.trustAsResourceUrl('/jobs/fund/' + $place.jobs[i]._id);
					if ($place.jobs[i].expireDate>$rootScope.currentDate) {
						$place.activeJobs.push($place.jobs[i]);
					}
				}
			}

			$place.about = $sce.trustAsHtml($place.about);
			$place.travelInformation = $sce.trustAsHtml($place.travelInformation);


			$scope.place = $place;


			map = $rootScope.getMapInstance($('#results-map'));
			google.maps.event.trigger(map, 'resize');
			var pos = new google.maps.LatLng($place.location.coordinates[1], $place.location.coordinates[0]);
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
		if ($rootScope.selectedPlace) {
			setData($rootScope.selectedPlace);
			showNearbyPlaces($rootScope.selectedPlace);
		}
		else {
			$http({
					url: '/ajax/places/' + placeId
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



opendoorControllers.controller('UserViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
	function($scope, $rootScope, $location, $http, $cookies, $anchorScroll, $sce) {
		var userId = $location.url().split('/').pop();
		$scope.userId = userId;



		function setData($user) {
			$scope.user = $user;

			$scope.places = [];
			$scope.message = 'Loading…';
			$http({
				url: '/ajax/places/maintained/' + $user._id
				, method: 'GET'
			}).
			success(function (data){
				if (Array.isArray(data)) {
					if (data.length) {
						for (var i = 0; i < data.length; i++) {
							data[i].distance = Math.round(data[i].distance);
						}
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no maintained places';
					}
					$scope.places = data;
				}
				else {
					$scope.message = 'An error happened during request';
					$scope.places = [];
				}
			}).
			error(function () {
				$scope.message = 'Error processing request';
			});
		}
		if ($rootScope.selectedUser) {
			setData($rootScope.selectedUser);
		}
		else {
			$http({
				url: '/ajax/users/' + userId
				, method: 'GET'
			}).
			success(function (data) {
				if (typeof data== 'object') {
					setData(data[0]);
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



opendoorControllers.controller('JobViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
	function($scope, $rootScope, $location, $http, $cookies, $anchorScroll, $sce) {
		var jobId = $location.url().split('/').pop();
		$scope.jobId = jobId;



		function setData($job) {
			$scope.job = $job;
		}
		$http({
			url: '/ajax/jobs/' + jobId
			, method: 'GET'
		}).
		success(function (data) {
			console.log(data);
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
			$scope.submitPath = '/places/edit/' + placeId;
			$scope.additionalFieldsAreVisible = true;
		}
		var map = $rootScope.getMapInstance($('#results-map'));

		google.maps.event.addListenerOnce(map, 'idle', function(){
			google.maps.event.trigger(map, 'resize');
		});


		var pos = new google.maps.LatLng(0,0);
		map.setCenter(pos);
		map.setZoom(2);

		$('.timepicker-input').timepicker({showMeridian: false, defaultTime: false});
		$('.location-picker').locationpicker();
		//$('textarea').trumbowyg();


		$denominationsEl.tagit({
				availableTags: denominations
			,	autocomplete: {
						delay: 0
				}
		});

		$scope.religions = $rootScope.religions;

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
				var regExp = new RegExp(".*" + RegExp.escape(value.toLowerCase()) + ".*");
				var matchesWasFound = false;
				for (var i = 0; i<groups.length; i++) {
					if (typeof groups[i].name=='string' && regExp.test(groups[i].name.toLowerCase())) {
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



		$scope.searchByAddress = function() {
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
			}).
			success(function (data){
				$groupsEl.empty();
				groups = data;
				for (var i=0; i<data.length; i++) {
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
			}).
			success(function (data){
				$denominationsEl.tagit('removeAll');
				while (denominations.pop()) {
				}
				for (var i=0; i<data.length; i++) {
					var denomination = data[i].name;
					denominations.push(denomination);
					if ($scope.place.denominations && $scope.place.denominations.indexOf(denomination) != -1) {
						$denominationsEl.tagit('createTag', denomination);
					}
				}
			});
		}


		$religionEl.on('change', function(){
			loadOptionsForReligion($religionEl.val());
		});

		$groupsEl.on('change', function(){
			$scope.place.groupName = $groupsEl.val();
		});


		function setData($place) {
			if ($place.mainMeetingTime){
				var mainMeetingTime = new Date($place.mainMeetingTime);
				$place.mainMeetingTime = mainMeetingTime.toString('HH:mm');
			}


			$scope.isMaintainer = $place.maintainer && $place.maintainer._id && $place.maintainer._id == $rootScope._id;
			$scope.place = $place;

			loadOptionsForReligion($place.religion);
			$groupsEl.selectpicker('val', $place.groupName);
			map.setMarker($place.location.coordinates);
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
			$scope.edit = false;
			$scope.mode = 'add';
			$scope.place = {
				address: {}
				,	location: {}
			};
		}
	}
]);



opendoorControllers.controller('JobFundCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
		$scope.alertType = 'info';
		$scope.alertTitle = 'Success';
		$scope.alertMessage = 'Your job was added successfully. Please pay $1 to publish the job on the Opportunities page.';

		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				handler.open({
					name: siteconfig.sitename
					, description: 'Payment for job posting'
					, amount: 100
				});
			}
		};


		var handler = StripeCheckout.configure({
			key: siteconfig.apiKeys.stripePublic
			, locale: 'auto'
			, token: function(token) {
				document.forms.form.elements.token.value = token.id;
				document.forms.form.submit();
			}
		});

		$scope.$on("$destroy", function() {
			handler.close();
		});


	}
]);


opendoorControllers.controller('JobSearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {

		var $religionEl = $('select[name="religion"]');
		$scope.jobs = null;
		$scope.message = '';
		$scope.religionsList = $rootScope.religions;
		var hiddenGroupName;

		$scope.openJob = function($event, job) {
			if ($event.which == 2) {
				$window.open('/jobs/' + job._id, '_blank');
			}
			else {
				$location.url('/jobs/' + job._id);
			}
		};

		function loadOptionsForReligion(religion) {
			console.log(religion);
			if (!religion || religion == 'All religions') {
				$scope.groupsList = ['Select religion'];
				$scope.groupName = $scope.groupsList[0];
			}
			else {
				$http({
					url: '/ajax/religionGroups'
					, method: 'GET'
					, params: {
						religion: religion
					}
				}).
				success(function (data){
					$scope.groupsList = ['All groups'];

					for (var i=0; i<data.length; i++) {
						$scope.groupsList.push(data[i].name);
					}

					$scope.groupName = $scope.groupsList.indexOf(hiddenGroupName) != -1 ? hiddenGroupName : $scope.groupsList[0];
				});
			}
		}

		$http({
			url: '/ajax/countries'
			, method: 'GET'
		}).
		success(function (data){
			$scope.countriesList = ['All countries'];

			$scope.countriesList = $scope.countriesList.concat(data);
			$scope.country = $scope.country || $scope.countriesList[0];
		});


		$religionEl.on('change', function(){
			loadOptionsForReligion($religionEl.val());
		});

		function setSearchParams() {

			var requestParams = {
				country: $scope.country == 'All countries' ? null : $scope.country
				, locality: $scope.locality == 'Select country' || $scope.locality == 'All cities' ? null : $scope.locality
				, religion: $scope.religion == 'All religions' ? null : $scope.religion
				, groupName: $scope.groupName == 'Select religion' || $scope.groupName == 'All groups' ? null : $scope.groupName
			};
			$location.search('country', requestParams.country || null);
			$location.search('locality', requestParams.locality || null);
			$location.search('religion', requestParams.religion || null);
			$location.search('groupName', requestParams.groupName || null);
		}
		$scope.searchJobs = function() {
			setSearchParams();
		};

		function onError() {
			$scope.message = 'An error happened during request';
			$scope.jobs = null;
		}

		var requestParams = $location.search();
		$scope.country = requestParams.country;
		$scope.locality = requestParams.locality;
		$scope.religion = requestParams.religion;
		$scope.groupName = requestParams.groupName;
		console.log(requestParams);
		hiddenGroupName = $scope.groupName;
		loadOptionsForReligion($scope.religion);
		$scope.message = 'Searching…';
		$http({
			url: '/ajax/jobs/search'
			, method: 'GET'
			, params: requestParams
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no jobs found';
				}
				$scope.jobs = data;
			}
			else {
				onError();
			}
		}).
		error(onError);

	}
]);

opendoorControllers.controller('JobFormCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {


		var query = $location.search();

		var jobId = $location.path().split('/').pop();

		if (jobId == 'add') {
			jobId = 0;
		}


		function setData($job) {
			$scope.job = $job;
		}


		if (jobId) {
			$scope.edit = true;
			$scope.mode = 'edit';

			$http({
				url: '/ajax/jobs/' + jobId
				, method: 'GET'
			}).
			success(function (data) {
				if (typeof data== 'object') {
					setData(data[0]);
				}
				else {
					$location.url('/notfound');
				}
			}).
			error(function () {
				$location.url('/notfound');
			});

		}
		else {
			$scope.edit = false;
			$scope.mode = 'add';

			setData({place: query.place});
		}
	}
]);

opendoorControllers.controller('EventAddCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
		var geocoder = new google.maps.Geocoder();
		var map = $rootScope.getMapInstance($('#results-map'));
		var $datetimepicker = $('#datetimepicker');
		var $locationEl = $('[name="location"]');
		$datetimepicker.datetimepicker();
		$datetimepicker.on('dp.change', function(){
			$scope.date = $('input', $datetimepicker).val();
		});
		google.maps.event.addListenerOnce(map, 'idle', function(){
			google.maps.event.trigger(map, 'resize');
		});

		a=$scope;

		var pos = new google.maps.LatLng(0,0);
		map.setCenter(pos);
		map.setZoom(2);


		$scope.searchByAddress = function() {
			console.log($scope.address);
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
		console.log(placeId);
		$scope.placeId = placeId;


		function setData($place) {

			$scope.place = $place;
			$scope.address  = $place.concatenatedAddress;
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
]);


opendoorControllers.controller('FormCtrl', ['$scope',
	function($scope) {
	}
]);


opendoorControllers.controller('DonateCtrl', ['$scope', '$location', '$rootScope', '$http',
	function($scope, $location, $rootScope, $http) {
		$scope.months = 12;
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				handler.open({
					name: siteconfig.sitename
					, description: 'Donate'
					, amount: $scope.months * 1000
				});
			}
		};


		var handler = StripeCheckout.configure({
				key: siteconfig.apiKeys.stripePublic
			//image: '/img/documentation/checkout/marketplace.png',
			, locale: 'auto'
			//, token: document.forms.form.submit
			, token: function(token) {
				document.forms.form.elements.token.value = token.id;
				document.forms.form.submit();

				console.log(token);
				// Use the token to create the charge with a server-side script.
				// You can access the token ID with `token.id`
				}
		});

		$scope.$on("$destroy", function() {
			console.log('close handler');
			handler.close();
		});


		var placeId = $location.url().split('/').pop();
		$scope.placeId = placeId;


		function setData($place) {

			$scope.place = $place;
		}

		if ($rootScope.selectedPlace) {
			setData($rootScope.selectedPlace);
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
]);


opendoorControllers.controller('SubscribeForNotificationFormCtrl', ['$scope', '$location',
	function($scope, $location) {
		var query = $location.search();
		$scope.lat = query.lat;
		$scope.lng = query.lng
	}
]);

opendoorControllers.controller('SearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {
		$('.location-picker').locationpicker();
		var $locationInputEl = $('.location-picker-address');

		$scope.places = null;
		$scope.message = 'Press "Search" to find nearest places';
		var $table = $('#search-table');
		var map;

		function createMap() {
			if (!$scope.message.length) {
				map = $rootScope.getMapInstance($('#results-map'));
				google.maps.event.addListenerOnce(map, 'idle', function(){
					addMarkers($scope.places);
				});
				addMarkers($scope.places);
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
			map.removeMarkers();
			map.markers.push(new google.maps.Marker({
				position: {lat: parseFloat(location[1]), lng: parseFloat(location[0])}
				,	map: map
				,	icon: map.icons.location
				,	title: 'My location'
			}));

			for (var i=0; i<data.length; i++) {
				var pos = new google.maps.LatLng(data[i].location.coordinates[1], data[i].location.coordinates[0]);

				// I mirror all markers against search position in order to keep it in center of map
				var mirroredPoint = mirrorPoint(data[i].location.coordinates, location);
				var mirroredPos = new google.maps.LatLng(mirroredPoint[1], mirroredPoint[0]);
				var marker = map.addMarker({
						position: pos
					,	map: map
					,	icon: map.icons.brightPoi
					,	title: data[i].name
				});
				bounds.extend(pos);
				bounds.extend(mirroredPos);

				(function(marker, i) {
					google.maps.event.addListener(marker, 'mouseover', function () {
						marker.setIcon(map.icons.defaultPoi);
						$('tr:nth-child(' + (i+1) + ')', $table).addClass('hover');
					});
					google.maps.event.addListener(marker, 'mouseout', function () {
						marker.setIcon(map.icons.brightPoi);
						$('tr:nth-child(' + (i+1) + ')', $table).removeClass('hover');
					});
				})(marker, i);

			}

			google.maps.event.trigger(map, 'resize');
			map.fitBounds(bounds);
		};

		$scope.religionsList = $rootScope.religions;
		$scope.religion = '';

		$scope.mouseOver = function(i) {
			map.markers[i+1].setIcon(map.icons.defaultPoi);
		};
		$scope.mouseOut = function(i) {
			map.markers[i+1].setIcon(map.icons.brightPoi);
		};


		function setSearchParams() {
			var location = document.forms.form.location.value.split(', ');
			if (location.length==2) {

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
			//$scope.locationIsInvalid = (location.length<2);
		}
		$scope.searchPlaces = function() {
			$scope.form.$submitted = true;
			if ($locationInputEl.attr('active')=='1') {
				$locationInputEl.one('change', setSearchParams);
			}
			else {
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
			}).
			success(function (response){
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
			}).
			error(onError);
		}

	}
]);


opendoorControllers.controller('PlacesListCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {

		$scope.places = null;
		var $table = $('#search-table');
		$scope.religionsList = $rootScope.religions;
		$scope.religion = '';


		function setSearchParams() {

			var requestParams = {
					name: $scope.name
				, skip: $scope.skip
				, limit: $scope.limit
				, religion: $scope.religion
				, maintained: $scope.maintained
			};

			$location.search('name', requestParams.name || null);
			$location.search('skip', requestParams.skip || null);
			$location.search('limit', requestParams.limit || null);
			$location.search('religion', requestParams.religion || null);
			$location.search('maintained', requestParams.maintained || null);
		}
		$scope.searchPlaces = function() {
			console.log($scope.skip);
			$scope.form.$submitted = true;
			setSearchParams();
		};

		$scope.setPage = function(n) {
			$scope.skip = (n-1) * $scope.itemsPerPage;
			$scope.form.$submitted = true;
			setSearchParams();
		};


		function onError() {
			$scope.message = 'An error happened during request';
			$scope.places = null;
		}



		var requestParams = $location.search();
		$scope.name = requestParams.name;
		$scope.skip = requestParams.skip;
		$scope.limit = requestParams.limit;
		$scope.religion = requestParams.religion;
		$scope.maintained = requestParams.maintained;
		$scope.message = 'Searching…';
		$http({
			url: '/ajax/places/search'
			, method: 'GET'
			, params: requestParams
		}).
		success(function (response){
			if (typeof response == 'object' && Array.isArray(response.results)) {
				var places = response.results;
				if (places.length) {
					for (var i=0; i< places.length; i++) {
						if (places[i].updatedAt) {
							places[i].updatedAt = (new Date(places[i].updatedAt)).toString('MM/dd/yyyy');
						}
					}
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no places of worship';
				}
				$scope.places = places;
				$scope.count = response.count;
				$rootScope.getPages($scope);
			}
			else {
				onError();
			}
		}).
		error(onError);
	}

]);


opendoorControllers.controller('UsersListCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {

		$scope.users = null;

		$scope.openUser = function($event, user) {
			//$rootScope.selectedUser = user;
			if ($event.which == 2) {
				$window.open('/users/' + user._id, '_blank');
			}
			else {
				$location.url('/users/' + user._id);
			}
		};

		$scope.setPage = function(n) {
			$scope.skip = (n-1) * $scope.itemsPerPage;
			$scope.form.$submitted = true;
			setSearchParams();
		};

		function setSearchParams() {

			var requestParams = {
					maintainers: $scope.maintainers
				, name: $scope.name
				, email: $scope.email
				, skip: $scope.skip
				, limit: $scope.limit
			};

			$location.search('skip', requestParams.skip || null);
			$location.search('limit', requestParams.limit || null);
			$location.search('name', requestParams.name || null);
			$location.search('email', requestParams.email || null);
			$location.search('maintainers', requestParams.maintainers || null);
		}
		$scope.searchUsers = function() {
			$scope.form.$submitted = true;
			setSearchParams();
		};

		function onError() {
			$scope.message = 'An error happened during request';
			$scope.users = null;
		}

		var requestParams = $location.search();
		$scope.skip = requestParams.skip;
		$scope.limit = requestParams.limit;
		$scope.name = requestParams.name;
		$scope.email = requestParams.email;
		$scope.maintainers = requestParams.maintainers;
		$scope.message = 'Searching…';
		$http({
			url: '/ajax/users'
			, method: 'GET'
			, params: requestParams
		}).
		success(function (response){
			if (typeof response == 'object' && Array.isArray(response.results)) {
				var data = response.results;
				if (data.length) {
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no users';
				}
				$scope.users = data;
				$scope.count = response.count;
				$rootScope.getPages($scope);
			}
			else {
				onError();
			}
		}).
		error(onError);
	}

]);


opendoorControllers.controller('LastPlacesCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {
		$scope.places = [];

		$scope.message = 'Loading…';
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
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no places';
				}
				$scope.places = data;
			}
			else {
				$scope.message = 'An error happened during request';
				$scope.places = [];
			}
		}).
		error(function () {
			$scope.message = 'Error processing request';
		});
	}


]);


opendoorControllers.controller('MaintainedPlacesCtrl', ['$scope', '$http',
	function($scope, $http) {
		$scope.places = [];
		$scope.message = 'Loading…';
		$http({
			url: '/ajax/places/maintained'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no maintained places';
				}
				$scope.places = data;
			}
			else {
				$scope.message = 'An error happened during request';
				$scope.places = [];
			}
		}).
		error(function () {
			$scope.message = 'Error processing request';
		});
	}


]);


opendoorControllers.controller('PlaceClaimsCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
	function($scope, $http, $rootScope, $location, $window) {

		$scope.message = 'Loading…';
		$http({
				url: '/ajax/claims'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no claims';
				}
				$scope.claims = data;
			}
			else {
				$scope.message = 'An error happened during request';
			}
		}).
		error(function () {
			$scope.message = 'Error processing request';
		});
	}

]);


opendoorControllers.controller('PlaceChangesCtrl', ['$scope', '$http', '$rootScope', '$location', '$window', '$sce',
	function($scope, $http, $rootScope, $location, $window, $sce) {

		$scope.message = 'Loading…';
		$http({
			url: '/ajax/placechanges'
			, method: 'GET'
		}).
		success(function (data){
			if (Array.isArray(data)) {
				if (data.length) {
					for (var i=0; i < data.length; i++) {
						var change = data[i];
						if (Array.isArray(change.value)) {
							change.value = change.value.join(', ');
						}
						else if (change.field == 'address') {
							change.value = [change.value.line1, change.value.line2, change.value.locality, change.value.region, change.value.country, change.value.postalCode].cleanArray().join(', ');
						}
						else if (change.field == 'location') {
							change.value = change.value.coordinates.join(', ');
						}
						else if (change.field == 'bannerPhoto' || change.field == 'leaderPhoto') {

							change.htmlValue = $sce.trustAsHtml('<img class="change-preview-photo" src="/photos/' + change.value + '">');
						}
					}
					$scope.message = '';
				}
				else {
					$scope.message = 'There are no suggested changes';
				}
				$scope.changes = data;
			}
			else {
				$scope.message = 'An error happened during request';
			}
		}).
		error(function () {
			$scope.message = 'Error processing request';
		});
	}

]);

opendoorControllers.controller('FeedbackCtrl', ['$scope', '$rootScope', '$location',
	function($scope, $rootScope, $location) {
		$scope.targetPage = $location.hash();
	}
]);

opendoorControllers.controller('EditorProposalCtrl', ['$scope', '$routeParams', '$sce',
	function($scope, $routeParams, $sce) {
		$scope.action = $sce.trustAsResourceUrl('/places/editorproposal/' + $routeParams.id);
		$scope.placeId = $routeParams.id;
	}
]);


opendoorControllers.controller('FooterCtrl', ['$scope', '$rootScope', '$location', '$window',
	function($scope, $rootScope, $location, $window) {
		var feedbackPage = '/feedback';
		$scope.leaveFeedback = function($event) {
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
		var search = $location.search();
		var message;
		if ($location.path() == '/notfound') {
			message = 'notfound';
		}
		else if (!$location.path().indexOf('/promotion/')) {
			message = 'donation';
		}
		else {
			message = search.message;
		}
		console.log($location);
		switch (message) {
			case 'donation':
				$scope.alertType = 'default';
				$scope.alertTitle = 'Donation was successful';
				$scope.alertMessage = 'Thank you for your donation.';
			break;
			case 'pleaselogin':
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'Please login first';
				break;
			case 'alreadyregistered':
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'Your email already exists in our database. Please try to restore your password';
			break;
			case 'notfound':
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'Page not found';
				break;
			case 'proposalsent':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Your proposal has been sent';
				break;
			case 'messagesent':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Your message has been sent';
				break;
			case 'feedbacksaved':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Your message has been received';
				$scope.alertMessage = 'Thank you for taking the time to send us feedback. We will reply to you as soon as we can and normally within 24 hours.';
				break;
			case 'notificationsaved':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Your subscription has been saved';
				$scope.alertMessage = 'We will notify you when place near you will be added';
				break;
			case 'changesadded':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Your changes has been added';
				$scope.alertMessage = 'Please wait until place maintainer accept your changes.';
				break;
			case 'claimadded':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Your claim has been added';
				$scope.alertMessage = 'Please wait until administrator accept your claim.';
				break;
			case 'changeaccepted':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Change has been accepted';
				break;
			case 'changedenied':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Change has been denied';
				break;
			case 'claimaccepted':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Claim has been accepted';
				break;
			case 'claimdenied':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Claim has been denied';
				break;
			case 'reviewsaved':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Your review has been saved';
				$scope.alertMessage = 'Thank you for taking the time to place a review.';
				break;

			case 'eventadded':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Your event has been added';
				break;
			case 'placeadded':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Place was added successfully. Confirmation link was sent to your mail';
				break;
			case 'placesaved':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Place was saved successfully.';
				break;
			case 'placeconfirmed':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Place was confirmed successfully';
				break;
			case 'placeconfirmationerror':
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'Error during place confirmation';
				break;
			case 'subscriptionadded':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Subscription was added successfully';
				break;
			case 'verifysubscription':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'We\'ve sent confirmation details on your email';
				break;
			case 'subscriptionexists':
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'You are already subscribed on this place';
				break;
			case 'subscriptionconfirmed':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Subscription was confirmed successfully';
				break;
			case 'subscriptionconfirmationerror':
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'Error during subscription confirmation';
				break;
			case 'jobfunded':
				$scope.alertType = 'info';
				$scope.alertTitle = 'Success';
				$scope.alertMessage = 'Job was funded successfully';
				break;
			default:
				$scope.alertType = 'danger';
				$scope.alertTitle = 'Error';
				$scope.alertMessage = 'An unexpected error happened';
			break;
		}
		console.log(search);
		console.log(search);
		$scope.back = search.back;
	}
]);
