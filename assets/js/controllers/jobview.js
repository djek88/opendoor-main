/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('JobViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
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
});