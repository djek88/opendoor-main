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
		function setData($place) {
			$scope.$imageSrc = 'photos/' + $place._id + $place.photoExt;
			$scope.$place = $place;
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
				console.log(data);
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

opendoorControllers.controller('PlaceAddCtrl', ['$scope', '$rootScope', '$location', '$http',
	function($scope, $rootScope, $location, $http) {
		$scope.$faiths = $rootScope.$faiths;
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

		$scope.$places = [];
		$scope.$message = 'Press "Search" to find nearest places';
		$scope.$searchPlaces = function() {
			$scope.form.$submitted = true;
			if ($scope.form.$valid) {
				var location = document.forms.form.location.value.split(',');
				if (location.length) {
					console.log($scope.form.faiths.$modelValue);
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
							for (var i in data) {
								data[i].distance = Math.round(data[i].distance);
							}
							$scope.$message = '';
						}
						else {
							$scope.$message = 'There are no places nearby';
						}
						$scope.$places = data;
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
			case 'placeadded':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Place was added successfully';
				break;
			case 'feedbacksaved':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Thank you for the feedback';
				break;
			case 'placeaddded':
				$scope.$alertType = 'info';
				$scope.$alertTitle = 'Success';
				$scope.$alertMessage = 'Location was added successfully';
				break;
			default:
				$scope.$alertType = 'danger';
				$scope.$alertTitle = 'Error';
				$scope.$alertMessage = 'An unexpected error happened';
			break;
		}
	}
]);
