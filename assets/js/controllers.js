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

opendoorControllers.controller('ToolbarCtrl', ['$scope', '$cookies',
	function($scope, $cookies) {
		$scope.$email = $cookies.get('email');
		$scope.$isLoggedIn = !!$scope.$email;
	}
]);

opendoorControllers.controller('PlaceViewCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
		var userPosition = 0;
		var map;
		function addUserPositionMarker() {
			map.addMarker({
					position: {lat: userPosition.latitude, lng: userPosition.longitude}
				,	icon: '/assets/img/mylocation.png'
				,	title: 'My location'
			});
		}
		function setData($place) {
			$scope.$imageSrc = 'photos/' + $place._id + $place.photoExt;
			var mainMeetingTime = new Date($place.mainMeetingTime);
			$place.mainMeetingTime = $rootScope.getTime(mainMeetingTime);

			$scope.$place = $place;
			map = $rootScope.$getMapInstance($('#results-map'));

			function afterInit() {

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
			//google.maps.event.addListenerOnce(map, 'idle', afterInit);
			afterInit();
		}
		if ($rootScope.$selectedPlace) {
			setData($rootScope.$selectedPlace);
		}
		else {
			var id = $location.url().split('/').pop();
			$http({
					url: '/ajax/places/' + id
				, method: 'GET'
			}).
			success(function (data, status, headers, config) {
				if (typeof data== 'object') {
					setData(data);
				}
				else {
					$location.url('/notfound');
				}
			}).
			error(function (data, status, headers, config) {
				$location.url('/notfound');
			});
		}




	}
]);

opendoorControllers.controller('PlaceAddCtrl', ['$scope', '$rootScope',
	function($scope, $rootScope) {
		$scope.$additionalFieldsAreVisible = false;

		$('.timepicker-input').timepicker({showMeridian: false, defaultTime: false});

		//$.fn.select2.amd.require([
		//	'select2/data/array',
		//	'select2/utils'
		//], function (ArrayData, Utils) {
		//	function CustomData ($element, options) {
		//		CustomData.__super__.constructor.call(this, $element, options);
		//	}
		//
		//	Utils.Extend(CustomData, ArrayData);
		//
		//	CustomData.prototype.query = function (params, callback) {
		//		var data = {
		//			results: []
		//		};
		//		console.log(params)
		//
		//		//for (var i = 1; i < 5; i++) {
		//		//	var s = "";
		//		//
		//		//	for (var j = 0; j < i; j++) {
		//		//		s = s + params.term;
		//		//	}
		//		//
		//		//	data.results.push({
		//		//		id: params.term + i,
		//		//		text: s
		//		//	});
		//		//}
		//
		//		callback(data);
		//	};


			$('select[name="groupName"]').select2({
				ajax: {
					url: '/ajax/religionGroups',
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return {
							name: params.term, // search term
							religion: 'Christianity'
						};
					}
				}
			});
		//});

		$('input[name="denominations"]').tagit({
			autocomplete: {
				source: '/ajax/denominations'
			}
		});

		$scope.$religions = $rootScope.$religions;
		$scope.submitForm = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				document.forms.form.submit();
			}
		};
	}
]);

opendoorControllers.controller('ReviewAddCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
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
		$scope.$places = [];
		$scope.$message = 'Press "Search" to find nearest places';
		var normalIcon = '/assets/img/spotlight-poi-bright.png';
		var hoverIcon = '/assets/img/spotlight-poi.png';
		var $table = $('#search-table');
		var map;
		var markers = [];

		function createMap() {
			if (!$scope.$message.length) {
				map = $rootScope.$getMapInstance($('#results-map'));
				google.maps.event.addListenerOnce(map, 'idle', function(){
					console.log('addMarkers-idle');
					addMarkers($scope.$places);
				});
				console.log('addMarkers');
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

			map.markers.push(new google.maps.Marker({
				position: {lat: $scope.$location[0], lng: $scope.$location[1]}
				,	map: map
				,	icon: '/assets/img/mylocation.png'
				,	title: 'My location'
			}));

			for (var i=0; i<data.length; i++) {
				var pos = new google.maps.LatLng(data[i].location.coordinates[0], data[i].location.coordinates[1]);

				// I mirror all markers against search position in order to keep it in center of map
				var mirroredPoint = mirrorPoint(data[i].location.coordinates, $scope.$location);
				var mirroredPos = new google.maps.LatLng(mirroredPoint[0], mirroredPoint[1]);
				var marker = map.addMarker({
						position: pos
					,	map: map
					,	icon: normalIcon
					,	title: data[i].name
				});
				bounds.extend(pos);
				bounds.extend(mirroredPos);

				(function(marker, i) {
					google.maps.event.addListener(marker, 'mouseover', function () {
						marker.setIcon(hoverIcon);
						$('tr:nth-child(' + (i+1) + ')', $table).addClass('hover');
					});
					google.maps.event.addListener(marker, 'mouseout', function () {
						marker.setIcon(normalIcon);
						$('tr:nth-child(' + (i+1) + ')', $table).removeClass('hover');
					});
				})(marker, i);

			}
			//google.maps.event.addListenerOnce(map, 'idle', function(){
			//	map.fitBounds(bounds);
			//	console.log('fitBounds-idle')
			//});
			map.fitBounds(bounds);
		};

		$scope.$religionsList = $rootScope.$religions;
		$scope.religions = '*';
		$scope.$openPlace = function($event, $place) {
			$rootScope.$selectedPlace = $place;
			if ($event.which == 2) {
				$window.open('/places/' + $place._id, '_blank');
			}
			else {
				$location.url('/places/' + $place._id);
			}
		};


		$scope.$mouseOver = function(i) {
			map.markers[i+1].setIcon(hoverIcon);
		};
		$scope.$mouseOut = function(i) {
			map.markers[i+1].setIcon(normalIcon);
		};


		$scope.$searchPlaces = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {


				var location = document.forms.form.location.value.split(',');
				if (location.length) {

					var requestParams = {
						lat: location[0]
						, lng: location[1]
						, religions: $scope.form.religions.$modelValue
					};

					$location.search('lat', requestParams.lat);
					$location.search('lng', requestParams.lng);
					$location.search('religions', requestParams.religions);
					$rootScope.$address = document.forms.form.address.value;

				}
			}
		};

		function validateCoordinate(val) {
			val = parseFloat(val);
			return (!isNaN(val) && val <= 90 && val >= -90);
		}

		var requestParams = $location.search();
		if (validateCoordinate(requestParams.lat) && validateCoordinate(requestParams.lng)) {
			$scope.location = $rootScope.$address || requestParams.lat + ', ' + requestParams.lng;
			$scope.$location = [parseFloat(requestParams.lat), parseFloat(requestParams.lng)];
			$scope.$message = 'Searching…';
			$http({
				url: '/ajax/places/search'
				, method: 'GET'
				, params: requestParams
			}).
			success(function (data, status, headers, config){
				if (Array.isArray(data)) {
					if (data.length) {
						for (var i = 0; i < data.length; i++) {
							data[i].distance = Math.round(data[i].distance);
						}
						$scope.$message = '';
						$place = data[0];
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
			error(function (data, status, headers, config) {
				$scope.$message = 'Error processing request';
			});
		}

	}
]);

opendoorControllers.controller('FeedbackCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
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
			case 'feedbacksaved':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Your message has been received';
				$scope.$alertMessage = 'Thank you for taking the time to send us feedback. We will reply to you as soon as we can and normally within 24 hours.';
				break;
			case 'placeadded':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Place was added successfully. Confirmation link was sent to your mail';
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
