define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('CountriesListCtrl', ['$scope', '$http', '$location', '$window',
		function($scope, $http, $location, $window) {
			$scope.countries = null;
			$scope.message = 'Searching…';

			$scope.openCountry = openCountry;
			$scope.getLink = getLink;

			$http({
				url: '/ajax/countries',
				method: 'GET',
				params: {withPlaces: true}
			}).success(function (results){
				$scope.countries = results;
				$scope.message = results.length ? '' : 'There are no countries';
			}).error(function() {
				$scope.message = 'An error happened during request';
			});

			function openCountry($event, country) {
				var url = '/places/' + $scope.getLink(country);

				$event.which == 2 ? $window.open(url) : $location.url(url);
			}

			function getLink(country) {
				return country.replace(/ /g, '-').toLowerCase() + '/';
			}
		}
	]);
});