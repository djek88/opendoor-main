/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('EditorProposalCtrl', ['$scope', '$routeParams', '$sce',
		function ($scope, $routeParams, $sce) {
			$scope.action = $sce.trustAsResourceUrl('/places/editorproposal/' + $routeParams.id);
			$scope.placeId = $routeParams.id;
		}
	]);
});