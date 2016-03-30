/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('FeedbackCtrl', ['$scope', '$rootScope', '$location',
		function ($scope, $rootScope, $location) {
			$scope.targetPage = $location.hash();
		}
	]);
});