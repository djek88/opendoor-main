define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('LocalitiesListCtrl', ['$scope', '$http', '$location', '$window', '$routeParams',
		function($scope, $http, $location, $window, $routeParams) {
			$scope.selectedCountry = paramToText($routeParams.country);
			$scope.message = 'Searching…';

			$scope.openLocality = openLocality;
			$scope.getLink = getLink;

			$http({
				url: '/ajax/localities',
				method: 'GET',
				params: {country: $scope.selectedCountry}
			}).success(function(results) {
				$scope.localities = results;
				$scope.message = results.length ? '' : 'There are no localities';
			}).error(function() {
				$scope.message = 'An error happened during request';
			});

			function getLink(locality) {
				return $routeParams.country + '/' + locality.replace(/ /g, '-').toLowerCase();
			}

			function openLocality($event, locality) {
				var url = '/places/' + getLink(locality);

				$event.which == 2 ? $window.open(url) : $location.url(url);
			}

			function paramToText(param) {
				param = param.charAt(0).toUpperCase() + param.slice(1);
				return param.replace(/-/g, ' ');
			}
		}
	]);
});