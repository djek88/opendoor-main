/**
 *
 * Created by Vavooon on 17.12.2015.
 */




var opendoorControllers = angular.module('opendoorControllers', ['uiGmapgoogle-maps']);


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
		var addMarkersStates = 0;
		var userPosition = 0;
		var map;
		function addUserPositionMarker() {

			if (++addMarkersStates==2) {
				//console.log(userPosition)
				new google.maps.Marker({
					position: {lat: userPosition.latitude, lng: userPosition.longitude}
					,	map: map
					,	icon: '/assets/img/mylocation.png'
					,	title: 'My location'
				});
			}
		}
		function setData($place) {
			$scope.$imageSrc = 'photos/' + $place._id + $place.photoExt;
			$scope.$place = $place;
			map = new google.maps.Map(document.getElementById('results-map'), {
				center: {
					lat: $place.location.coordinates[0]
					, lng: $place.location.coordinates[1]
				}
				, zoom: 16
			});
			google.maps.event.addListenerOnce(map, 'idle', function(){
				addUserPositionMarker();
				new google.maps.Marker({
					position: {lat: $place.location.coordinates[0], lng: $place.location.coordinates[1]}
					,	map: map
					,	icon: '/assets/img/spotlight-poi.png'
					,	title: $place.name
				});
			});
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


		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(location) {
				$scope.$apply(function(){
					userPosition = {latitude: location.coords.latitude, longitude: location.coords.longitude};
					addUserPositionMarker();
				});
			});
		}

	}
]);

opendoorControllers.controller('PlaceAddCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
		$('.timepicker-input').timepicker({defaultTime: false});
		$scope.$faiths = $rootScope.$faiths;
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

opendoorControllers.controller('SearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$window', 'uiGmapIsReady',
	function($scope, $http, $rootScope, $location, $window, uiGmapIsReady) {
		$scope.$places = [];
		$scope.$message = 'Press "Search" to find nearest places';
		var normalIcon = '/assets/img/spotlight-poi-bright.png';
		var hoverIcon = '/assets/img/spotlight-poi.png';
		var addMarkersState = 0;
		var map;

		function createMap() {
			console.log('createMap');
			map = new google.maps.Map(document.getElementById('results-map'), {
				//center: {lat: 0, lng: 0},
				//zoom: 1
			});
			google.maps.event.addListenerOnce(map, 'idle', function(){
				addMarkers($scope.$places);
			});
		}
		console.log('afterinit');
		var markers = [];
		var $table = $('#search-table');

		var removeMarkers = function() {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
		};

		var mirrorPoint = function(p, o){
			var px = p[0]
				,	py = p[1]
				,	ox = o[0]
				,	oy = o[1];
			return [ox*2 - px, oy*2 - py];
		};


		var addMarkers = function(data) {
			if (++addMarkersState==2) {
				console.log('addmarkets');
				var bounds = new google.maps.LatLngBounds();

				removeMarkers();

				new google.maps.Marker({
					position: {lat: $scope.$location[0], lng: $scope.$location[1]}
					,	map: map
					,	icon: '/assets/img/mylocation.png'
					,	title: 'My location'
				});

				for (var i=0; i<data.length; i++) {
					var pos = new google.maps.LatLng(data[i].location.coordinates[0], data[i].location.coordinates[1]);

					// I mirror all markers against search position in order to keep it in center of map
					var mirroredPoint = mirrorPoint(data[i].location.coordinates, $scope.$location);
					var mirroredPos = new google.maps.LatLng(mirroredPoint[0], mirroredPoint[1]);
					var marker = new google.maps.Marker({
							position: pos
						,	map: map
						,	icon: normalIcon
						,	title: data[i].name
					});
					markers.push(marker);
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
				setTimeout(function(){
					map.fitBounds(bounds);
				},200);

				//Try to do it one more time because sometimes it doesn't work
				setTimeout(function(){
					map.fitBounds(bounds);
				},1000);
				addMarkersState=1;
			}


		};

		$scope.$faithsList = $rootScope.$faiths;
		$scope.faiths = '*';
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
			markers[i].setIcon(hoverIcon);
		};
		$scope.$mouseOut = function(i) {
			markers[i].setIcon(normalIcon);
		};


		$scope.$searchPlaces = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				var location = document.forms.form.location.value.split(',');
				$scope.$location = [parseFloat(location[0]), parseFloat(location[1])];
				if (location.length) {
					$scope.$message = 'Searching…';
					$http({
							url: '/ajax/places/search'
						, method: 'GET'
						, params: {
								lat: location[0]
							, lng: location[1]
							, faiths: $scope.form.faiths.$modelValue
						}
					}).
					success(function (data, status, headers, config) {
						if (data.length) {
							for (var i=0; i<data.length; i++) {
								data[i].distance = Math.round(data[i].distance);
							}
							$scope.$message = '';
							$place = data[0];
						}
						else {
							$scope.$message = 'There are no places nearby';
						}
						$scope.$places = data;
						if (!map) {
							createMap();
						}
						addMarkers($scope.$places);
					}).
					error(function (data, status, headers, config) {
						$scope.$message = 'Error processing request';
					});
				}
			}
		};

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
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Thank you for the feedback';
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
