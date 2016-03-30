/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('FooterCtrl', ['$scope', '$rootScope', '$location', '$window',
		function ($scope, $rootScope, $location, $window) {
			var feedbackPage = '/feedback';
			$scope.leaveFeedback = function ($event) {
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

});