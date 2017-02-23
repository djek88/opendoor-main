define([
	'angular',
	// './controllers/search',
	//  './controllers/footer',
	 'angular-route',
	 'angular-cookies',
	 'trumbowyg-ng'
], function (angular) {
	'use strict';

	var titlePostfix = ' | OpenDoor.ooo';

	var opendoorApp = angular.module('opendoorApp', [
		'ngRoute',
		'ngCookies',
		'trumbowyg-ng'
	]);

	opendoorApp.directive('ngImageLoad', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			link: function (scope, elem, attrs) {
				var fn = $parse(attrs.ngImageLoad);
				elem.on('load', function (event) {
					scope.$apply(function() {
						fn(scope, { $event: event });
					});
				});
			}
		};
	}]);

	opendoorApp.directive('ngLocation', function() {
		return {
			restrict: 'A',
			require: 'ngModel',

			link: function(scope, element, attr, ctrl) {
				var $element = $(element);
				var options = {
					autoDetect: !!attr.ngLocationAutodetect
				};
				if ($element.next().prop('tagName')=='INPUT') {
					options.locationField = $element.next();
				}
				$element.locationpicker(options);
				function customValidator(ngModelValue) {
					ctrl.$setValidity('valid', !!$element.val());
					return ngModelValue;
				}
				customValidator();
				ctrl.$parsers.push(customValidator);
				scope.$watch(attr['ngModel'], customValidator);
			}
		};
	});

	opendoorApp.config(['$routeProvider', '$controllerProvider',
		function($routeProvider, $controllerProvider) {
			opendoorApp.registerController = $controllerProvider.register;

			function resolveDependencies($q, $rootScope, dependencies) {
				var defer = $q.defer();
				require(dependencies, function () {
					defer.resolve();
					$rootScope.$apply();
				});

				return defer.promise;
			}

			opendoorApp.resolveController = function(path) {
				return {
					load: ['$q', '$rootScope', function ($q, $rootScope) {
						return resolveDependencies($q, $rootScope, [path]);
					}]
				};
			}
		}
	]);

	opendoorApp.run(['$rootScope', '$location', '$window', '$q', function($rootScope, $location, $window, $q) {
		$rootScope.religions = [
			'Christianity',
			'Islam',
			'Hinduism',
			'Chinese',
			'Buddism',
			'Taoism',
			'Shinto',
			'Sikhism',
			'Judaism',
			'Korean Shamanism',
			'Caodaism',
			'Bahá\'í Faith',
			'Jainism',
			'Cheondoism',
			'Hoahaoism',
			'Tenriism'
		];

		$rootScope.leaveFeedback = function ($event) {
			var targetPage = '/feedback#' + $location.path();

			if ($event.which == 2) {
				$window.open(targetPage, '_blank');
			}
			else {
				$location.url(targetPage);
			}
		};

		$rootScope.currentDate = new Date;

		$rootScope.year = (new Date).browserToUTC().getFullYear();

		$rootScope.siteconfig = siteconfig;

		$rootScope.openPlace = function($event, place) {
			//$rootScope.selectedPlace = place;
			if ($event.which == 2) {
				$window.open('/places/' + place.uri, '_blank');
			}
			else {
				$location.url('/places/' + place.uri);
			}
		};

		$rootScope.submitForm = function() {
			this.form.$submitted = true;
			if (this.form.$valid) {
				document.forms.form.submit();
			} else {
				console.log(this.form);
			}
		};

		$rootScope.getPages = function($scope) {
			$scope.itemsPerPage = $scope.limit || siteconfig.frontend.itemsPerPage;
			$scope.pages = Math.ceil($scope.count / $scope.itemsPerPage);
			$scope.page = $scope.skip ?  $scope.skip / $scope.itemsPerPage : 0;
			var pagesList = [];
			var i;
			if ($scope.pages < 6) {
				for (i = 1; i <= $scope.pages; i++) {
					pagesList.push(i);
				}
			}
			else {
				var minPage = $scope.page - 3;
				if (minPage < 1) {
					minPage = 1;
				}
				var maxPage = minPage + 8;
				if (maxPage > $scope.pages) {
					maxPage = $scope.pages;
				}
				for (i = minPage; i <= maxPage; i++) {
					pagesList.push(i);
				}
			}
			$scope.pagesAsArray = pagesList;
			$scope.page++;
		};

		$rootScope.getMapInstance = function(targetEl) {
			return $q(function(resolve, reject) {
				require(['libs/googlemaps'], function (google) {
					window.google = google;

					if ($rootScope.map) {
						$(targetEl).append($rootScope.map.getDiv());
						$rootScope.map.removeMarkers();
						$rootScope.map.removeInfoWindows();
						return resolve($rootScope.map);
					}

					var div = $('<div id="map"></div>');
					$(targetEl).append(div);
					var map = $rootScope.map = new google.maps.Map(div[0], {
						scrollwheel: false,
						streetViewControl: false,
						draggable: !('ontouchend' in document)
					});
					map.markers = [];
					map.infoWindows = [];
					map.icons = {
						brightPoi: '/assets/img/spotlight-poi-bright.png',
						defaultPoi: '/assets/img/spotlight-poi.png',
						location: '/assets/img/mylocation.png'
					};

					var setPosition = google.maps.InfoWindow.prototype.setPosition;
					google.maps.InfoWindow.prototype.setPosition = function() {
						map.infoWindows.push(this);
						setPosition.apply(this, arguments);
					};

					map.removeMarkers = function () {
						var marker;
						while (marker = map.markers.pop()) {
							marker.setMap(null);
						}
					};

					map.removeInfoWindows = function () {
						var infoWindow;
						while (infoWindow = map.infoWindows.pop()) {
							infoWindow.setMap(null);
						}
					};

					map.addMarker = function (opts) {
						opts.map = map;
						var marker = new google.maps.Marker(opts);
						map.markers.push(marker);
						return marker;
					};

					map.setMarker = function (location, bounds) {
						if (bounds) {
							map.fitBounds(bounds);
						} else {
							map.setZoom(16);
						}

						var pos = new google.maps.LatLng(location[1], location[0]);
						map.addMarker({
							position: pos,
							map: map,
							icon: map.icons.defaultPoi
						});
						map.setCenter(pos);
					}

					resolve($rootScope.map);
				});
			});
		}
	}]);

	opendoorApp.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
	}]);

	opendoorApp.config( ['$compileProvider', function($compileProvider) {
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|tel):/);
	}]);

	opendoorApp.run(['$rootScope', '$route', '$cookies', '$location', function($rootScope, $route, $cookies, $location) {
		var $metaInfoEl = $('#metaInfo');

		function toUp(string) {
			var firstChar = string.substring(0, 1); // == "c"
			firstChar = firstChar.toUpperCase();
			var tail = string.substring( 1 ); // == "heeseburger"
			string = firstChar + tail;
			return string;
		}

		function onRouteChangeSuccess() {
			if ($route.current) {
				if (typeof($route.current.params.locality) != 'undefined') {
					var country = toUp($route.current.params.country);
					var locality = toUp($route.current.params.locality);
					if (country.length + locality.length >= 65 ) document.title = 'Places of Worship in ' + locality.replace('-', ' ') + ', ' + country.replace('-', ' ');
					else document.title = 'Places of Worship in ' + locality.replace('-', ' ') + ', ' + country.replace('-', ' ') + titlePostfix;
					$metaInfoEl.attr('name','description');
					$metaInfoEl.attr('content', 'Find your Place of Worship in ' + locality.replace('-', ' ') + ', ' + country.replace('-', ' ') + '. A complete list of all Places of Worship. Check to make sure your Place of Worship is listed and correct so others can find it.');
				} else if (typeof($route.current.params.country) != 'undefined') {
					var country = toUp($route.current.params.country);
					if (country.length >= 65 ) document.title = 'Places of Worship in ' + country.replace('-', ' ');
					else document.title = 'Places of Worship in ' + country.replace('-', ' ') + titlePostfix;
					$metaInfoEl.attr('name','description');
					$metaInfoEl.attr('content', 'Find your Place of Worship in '+ country.replace('-', ' ') +'. A complete list of all Places of Worship. Check to make sure your Place of Worship is listed and correct so others can find it.');
				} else {
					document.title = $route.current.title + titlePostfix;
					$metaInfoEl.attr('name','description');
					$metaInfoEl.attr('content', $route.current.meta || '');
				}
			}
		}

		$rootScope.$on('$routeChangeSuccess', onRouteChangeSuccess);

		$rootScope.$on('$routeChangeStart', function ($event, $newRoute, $oldRoute) {
			if ($newRoute.$$route
					&& !$location.search().disableLoginRedirect
					&& $newRoute.$$route.shouldLogin
					&& !$rootScope._id) {
				$location.url('/message?message=pleaselogin&back=/login');
			}
		});

		var id = $cookies.get('_id');
		if (typeof id == 'string'){
			$rootScope._id = id.substring(3, id.length-1);
			// set google analytics 'userId' for unite sessions
			ga('set', 'userId', $rootScope._id);
		}
		$rootScope.email = $cookies.get('email');
		$rootScope.isAdmin = $cookies.get('isAdmin') == 'true';
		$rootScope.isLoggedIn = !!$rootScope.email;
		onRouteChangeSuccess();
	}]);

	return opendoorApp;
});
