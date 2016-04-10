/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('UserViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
		function ($scope, $rootScope, $location, $http, $cookies, $anchorScroll, $sce) {
			var userId = $location.path().split('/').pop();
			$scope.userId = userId;


			function setData($user) {
				$scope.user = $user;

				$scope.places = [];
				$scope.message = 'Loading…';
				$http({
					url: '/ajax/places/maintained/' + $user._id
					, method: 'GET'
				}).success(function (data) {
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
				}).error(function () {
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
				}).success(function (data) {
					if (typeof data == 'object') {
						setData(data[0]);
					}
					else {
						$location.url('/notfound');
					}
				}).error(function () {
					$location.url('/notfound');
				});
			}


		}
	]);


	opendoorControllers.controller('JobViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
		function ($scope, $rootScope, $location, $http, $cookies, $anchorScroll, $sce) {
			var jobId = $location.path().split('/').pop();
			$scope.jobId = jobId;


			function setData($job) {
				$scope.job = $job;
			}

			$http({
				url: '/ajax/jobs/' + jobId
				, method: 'GET'
			}).success(function (data) {
				console.log(data);
				if (typeof data == 'object') {
					setData(data);
				}
				else {
					$location.url('/notfound');
				}
			}).error(function () {
				$location.url('/notfound');
			});


		}
	]);
});