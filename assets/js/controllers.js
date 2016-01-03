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
		$scope.$map = {};
		function setData($place) {
			$scope.$imageSrc = 'photos/' + $place._id + $place.photoExt;
			$scope.$place = $place;
			$scope.$map = {
					center: {
							latitude: $place.location.coordinates[0]
						, longitude: $place.location.coordinates[1]
					}
				,	marker: { // Map overrides 'center' field, what moves marker to center of map, so we need to clone it
							latitude: $place.location.coordinates[0]
						, longitude: $place.location.coordinates[1]
					}
				, $userLocation: $scope.$map.$userLocation
				, zoom: 16
			};
			console.log($scope.$map.$userLocation);
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
					$scope.$map.$userLocation = {latitude: location.coords.latitude, longitude: location.coords.longitude};
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
		var mapInstange = null;
		var markers = [];

		var removeMarkers = function() {

			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
		}


		var addMarkers = function(data) {
			if (++addMarkersState==2) {
				console.log('add markers');
				var $table = $('#search-table');
				var bounds = new google.maps.LatLngBounds();

				removeMarkers();
				markers = [];

				console.log($scope.$location)

				var myLocationMarker = new google.maps.Marker({
					position: {lat: parseFloat($scope.$location[0]), lng: parseFloat($scope.$location[1])}
					,	map: mapInstange
					,	icon: '/assets/img/mylocation.png'
					,	title: 'My location'
				});

				for (var i=0; i<data.length; i++) {
					var pos = new google.maps.LatLng(data[i].location.coordinates[0], data[i].location.coordinates[1]);
					var marker = new google.maps.Marker({
							position: pos
							//position: {lat: data[i].location.coordinates[0], lng: data[i].location.coordinates[1]}
						,	map: mapInstange
						,	icon: normalIcon
						,	title: data[i].name
					});
					markers.push(marker);
					bounds.extend(pos);

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
				mapInstange.fitBounds(bounds);
				console.log(mapInstange)
				addMarkersState--;
			}


		};
		uiGmapIsReady.promise(1).then(function(instances) {
			console.log('i')
			instances.forEach(function(inst) {
				mapInstange = inst.map;
				addMarkers($scope.$places);
			});
		});

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
		}
		$scope.$mouseOut = function(i) {
			markers[i].setIcon(normalIcon);
		}


		$scope.$searchPlaces = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				var location = document.forms.form.location.value.split(',');
				$scope.$location = location;
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
							$scope.$map = {
								center: {
									latitude: $place.location.coordinates[0]
									, longitude: $place.location.coordinates[1]
								}
								,	marker: { // Map overrides 'center' field, what moves marker to center of map, so we need to clone it
									latitude: $place.location.coordinates[0]
									, longitude: $place.location.coordinates[1]
								}
								//, zoom: 16
							};
						}
						else {
							$scope.$message = 'There are no places nearby';
						}
						$scope.$places = data;
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
