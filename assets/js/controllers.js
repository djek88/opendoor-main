/**
 *
 * Created by Vavooon on 17.12.2015.
 */




var opendoorControllers = angular.module('opendoorControllers', []);

opendoorControllers.controller('PhoneListCtrl', ['$scope', '$http',
	function ($scope, $http) {
		$http.get('phones/phones.json').success(function(data) {
			$scope.phones = data;
		});

		$scope.orderProp = 'age';
	}]);

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
			$scope.loginForm.$submitted = true;
			if ($scope.loginForm.$valid) {
				document.forms.loginForm.submit();
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
			$scope.registerForm.$submitted = true;
			if ($scope.registerForm.$valid) {
				document.forms.registerForm.submit();
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

opendoorControllers.controller('SearchCtrl', ['$scope', '$http',
	function($scope, $http) {
		var geocoder;
		//var map;
		function initialize() {
			geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(-34.397, 150.644);
			//var mapOptions = {
			//	zoom: 8,
			//	center: latlng
			//};
			//map = new google.maps.Map(document.getElementById("map"), mapOptions);
		}
		initialize();

		function getAddressFromLocation(location) {
			console.log(location);
			if (Array.isArray(location)) {
				console.log('is array');
				var latlng = {lat: location[0], lng: location[1]};
				geocoder.geocode({'location': latlng}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						$scope.$apply(function () {
							$scope.$address = results[0].formatted_address;
						});
					}
				});
			}
			else if (typeof location == 'object') {
				console.log('is object');
				$scope.$apply(function(){
					$scope.$address = location.formatted_address;
				});
			}
		}

		$scope.$places = [];
		$scope.$locationSelectorIsOpen = false;
		$scope.$toggleLocationSelection = function() {
			if ($scope.$locationSelectorIsOpen) {
				$scope.$searchPlaces();
			}
			$scope.$locationSelectorIsOpen = !$scope.$locationSelectorIsOpen;
		}
		$scope.$searchPlaces = function() {
			$http({
					url: '/places/search'
				,	method: 'GET'
				, params: {
						lat: $scope.$lat
					,	lng: $scope.$lng
				}
			}).
			success(function(data, status, headers, config) {
				for (var i in data) {
					data[i].distance = Math.round(data[i].distance);
				}
				$scope.$places = data;
			}).
			error(function(data, status, headers, config) {
				// log error
			});
		};

		$scope.showPosition = function (position) {
			$scope.$apply(function(){
				$scope.$lat = position.coords.latitude;
				$scope.$lng = position.coords.longitude;
				$scope.$accuracy = position.coords.accuracy;
			});
			getAddressFromLocation([position.coords.latitude, position.coords.longitude]);
			$scope.$searchPlaces();
			//var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
			//$scope.model.myMap.setCenter(latlng);
			//$scope.myMarkers.push(new google.maps.Marker({ map: $scope.model.myMap, position: latlng }));
		};

		$scope.showError = function (error) {
			switch (error.code) {
				case error.PERMISSION_DENIED:
					$scope.error = "User denied the request for Geolocation."
					break;
				case error.POSITION_UNAVAILABLE:
					$scope.error = "Location information is unavailable."
					break;
				case error.TIMEOUT:
					$scope.error = "The request to get user location timed out."
					break;
				case error.UNKNOWN_ERROR:
					$scope.error = "An unknown error occurred."
					break;
			}
			$scope.$apply();
		};


		$scope.$getLocationFromBrowser = function () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
			}
			else {
				$scope.error = "Geolocation is not supported by this browser.";
			}
		};

		$scope.$getLocationByAddress = function() {
			var address=$('#addressField').val();
			console.log(address);
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					console.log(results);
					$scope.$lat = results[0].geometry.location.lat();
					$scope.$lng = results[0].geometry.location.lng();
					getAddressFromLocation(results[0]);
					//map.setCenter(results[0].geometry.location);
					//var marker = new google.maps.Marker({
					//	map: map,
					//	position: results[0].geometry.location
					//});
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});

		};

		$scope.$getLocationFromBrowser();
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
				$scope.$alertMessage = 'Your email already exists in our database. Please try to restore your password';
			break;
			case 'notfound':
				$scope.$alertType = 'danger';
				$scope.$alertMessage = 'Page not found';
				break;
			default:
				$scope.$alertType = 'danger';
				$scope.$alertMessage = 'An unexpected error happened';
			break;
		}
	}
]);
