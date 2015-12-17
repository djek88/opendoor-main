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

opendoorControllers.controller('LoginCtrl', ['$scope', '$routeParams',
	function($scope, $routeParams) {
		// $scope.phoneId = $routeParams.phoneId;
		$scope.$close = function() {
			$('#loginModal').modal('hide');
		};
		$scope.$back = function() {
			window.history.back();
		};
		$('#loginModal').modal();
	}
]);

opendoorControllers.controller('RegisterCtrl', ['$scope', '$routeParams',
	function($scope, $routeParams) {
		// $scope.phoneId = $routeParams.phoneId;
		$scope.$back = function() {
			window.history.back();
		};
		$scope.$back = function() {
			window.history.back();
		};
		$('#loginModal').modal();
	}
]);

opendoorControllers.controller('ToolbarCtrl', ['$scope', '$routeParams',
	function($scope, $routeParams) {
		// $scope.phoneId = $routeParams.phoneId;
		$scope.$email = "test@example.com";
	}
]);

opendoorControllers.controller('SearchCtrl', ['$scope', '$routeParams',
	function($scope, $routeParams) {
		// $scope.phoneId = $routeParams.phoneId;
		$scope.$email = "test@example.com";
	}
]);
