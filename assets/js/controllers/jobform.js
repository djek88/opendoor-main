define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('JobFormCtrl', ['$scope', '$rootScope', '$location', '$http',
		function($scope, $rootScope, $location, $http) {
			var query = $location.search();
			var jobId = $location.path().split('/').pop();

			if (jobId == 'add') {
				jobId = 0;
			}

			function setData($job) {
				$scope.job = $job;
			}

			if (jobId) {
				$scope.edit = true;
				$scope.mode = 'edit';

				$http({
					url: '/ajax/jobs/' + jobId,
					method: 'GET'
				}).success(function(data) {
					if (typeof data == 'object') {
						setData(data[0]);
					} else {
						$location.url('/notfound');
					}
				}).error(function () {
					$location.url('/notfound');
				});
			} else {
				$scope.edit = false;
				$scope.mode = 'add';

				setData({place: query.place});
			}
		}
	]);
});