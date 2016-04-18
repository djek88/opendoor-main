/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('PlaceViewCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$anchorScroll', '$sce',
		function ($scope, $rootScope, $location, $http, $cookies, $anchorScroll, $sce) {
			var placeId = $location.path().substr(8);
			$scope.placeId = placeId;

			$scope.scrollTo = function (id) {
				$anchorScroll(id);
			};

			$scope.onLeaderPhotoLoad = function () {
				var $el = $('.leader-photo');
				if ($el.width() > $el.height()) {
					$el.removeClass('portrait');
				}
				else {
					$el.addClass('portrait');
				}
			};

			function showNearbyPlaces(place) {
				var requestParams = {
					lat: place.location.coordinates[1]
					, lng: place.location.coordinates[0]
					, limit: 4
					, exclude: place._id
					//, religion: place.religion
				};

				$http({
					url: '/ajax/places/search'
					, method: 'GET'
					, params: requestParams
				}).success(function (response) {

					if (typeof response == 'object' && Array.isArray(response.results)) {
						var places = response.results;
						if (places.length) {
							for (var i = 0; i < places.length; i++) {
								places[i].distance = Math.round(places[i].distance);
							}
							$scope.nearbyPlacesMessage = '';
						}
						else {
							$scope.nearbyPlacesMessage = 'There are no places nearby';
						}
						$scope.nearbyPlaces = places;
					}
					else {
						$scope.nearbyPlacesMessage = 'An error happened during request';
						$scope.nearbyPlaces = null;
					}
				}).error(function () {
					$scope.nearbyPlacesMessage = 'An error happened during request';
					$scope.nearbyPlaces = null;
				});
			}


			function setData($place) {
				document.title = $place.name + ' | OpenDoor.ooo';
				$scope.isMaintainer = $place.maintainer && $place.maintainer._id && $place.maintainer._id == $rootScope._id;
				if ($place.updatedAt) {
					$place.updatedAt = (new Date($place.updatedAt)).browserToUTC().toString(siteconfig.l10n.dateFormat);
				}

				if (typeof $place.homepage == 'string' && $place.homepage) {
					if ($place.homepage.substr(0, 4) != 'http') {
						$place.homepage = 'http://' + $place.homepage;
					}
				}

				if (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 || navigator.userAgent.toLowerCase().indexOf('ipod') != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1) {
					$place.externalMapsLink = $sce.trustAsResourceUrl('geo:0,0?q=' + $place.location.coordinates[1] + ',' + $place.location.coordinates[0] + '(' + $place.name + ')');
				}


				//if(navigator.userAgent.toLowerCase().indexOf('iphone')!=-1 || navigator.userAgent.toLowerCase().indexOf('ipod')!=-1 || navigator.userAgent.toLowerCase().indexOf("linux") != -1) {
				//	$place.externalMapsLink = $sce.trustAsResourceUrl('http://maps.apple.com/?ll=' + $place.location.coordinates[1] + ',' + $place.location.coordinates[0] + '&q=' + $place.name);
				//}
				//else if( navigator.userAgent.toLowerCase().indexOf("android") != -1) {
				//	$place.externalMapsLink = $sce.trustAsResourceUrl('geo:0,0?q=' + $place.location.coordinates[1] + ',' + $place.location.coordinates[0] + '(' + $place.name + ')');
				//}
				//
				//if ($place.phone) {
				//	$place.phoneUrl = $sce.trustAsResourceUrl('tel:' + $place.phone);
				//}

				$scope.mainMeetingText = '';
				if ($place.mainMeetingTime || $place.mainMeetingDay) {
					$scope.mainMeetingText += 'Main service ';
					if ($place.mainMeetingTime) {
						$scope.mainMeetingText += (new Date($place.mainMeetingTime)).browserToUTC().toString(siteconfig.l10n.timeFormat) + ' ';
					}
					if ($place.mainMeetingDay) {
						$scope.mainMeetingText += 'every ' + $place.mainMeetingDay;
					}
				}

				var currentDate = (new Date).browserToUTC();
				$place.pastEvents = [];
				if ($place.events) {
					for (var i = 0; i < $place.events.length; i++) {
						$place.events[i].dateObject = new Date($place.events[i].startDate);
						if ($place.events[i].startDate) {
							var startDate = new Date($place.events[i].startDate).browserToUTC();
							$place.events[i].startDate = startDate.toString(siteconfig.l10n.dateTimeFormat);
						}

						if ($place.events[i].endDate) {
							var endDate = new Date($place.events[i].endDate).browserToUTC();
							$place.events[i].endDate = endDate.toString(siteconfig.l10n.dateTimeFormat);
						}
						if ($place.events[i].dateObject < currentDate) {
							$place.pastEvents.push($place.events[i]);
							$place.events.splice(i, 1);
							i--;
							continue;
						}
						if ($place.events[i].dateObject > currentDate && (!$place.nextEvent || $place.events[i].dateObject < $place.nextEvent.dateObject)) {
							$place.nextEvent = $place.events[i];
						}
					}
				}


				$place.activePromotions = [];
				if ($place.promotions) {
					for (var i = 0; i < $place.promotions.length; i++) {
						var promotion = $place.promotions[i];
						promotion.dateObject = (new Date(promotion.expireDate)).browserToUTC();
						if (promotion.dateObject > currentDate) {
							if (promotion.url && promotion.url.substr(0, 4) != 'http') {
								promotion.url = 'http://' + promotion.url;
							}
							$place.activePromotions.push(promotion);
						}
					}
				}


				$place.activeJobs = [];
				if ($place.jobs.length) {
					for (var i = 0; i < $place.jobs.length; i++) {
						$place.jobs[i].expireDate = (new Date($place.jobs[i].expireDate)).browserToUTC();
						$place.jobs[i].action = $sce.trustAsResourceUrl('/jobs/fund/' + $place.jobs[i]._id);
						if ($place.jobs[i].expireDate > $rootScope.currentDate) {
							$place.activeJobs.push($place.jobs[i]);
						}
					}
				}

				$place.about = $sce.trustAsHtml($place.about);
				$place.travelInformation = $sce.trustAsHtml($place.travelInformation);


				$scope.place = $place;


				$rootScope.getMapInstance($('#results-map'))
					.then(function(map){

						google.maps.event.trigger(map, 'resize');
						var pos = new google.maps.LatLng($place.location.coordinates[1], $place.location.coordinates[0]);
						map.setCenter(pos);
						map.setZoom(16);
						map.addMarker({
							position: pos
							, icon: '/assets/img/spotlight-poi.png'
							, title: $place.name
						});

						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition(function (location) {
								$scope.$apply(function () {
									var userPosition = {latitude: location.coords.latitude, longitude: location.coords.longitude};
									$scope.map.addMarker({
										position: {lat: userPosition.latitude, lng: userPosition.longitude}
										, icon: '/assets/img/mylocation.png'
										, title: 'My location'
									});
								});
							});
						}

					});

			}

			if ($rootScope.selectedPlace) {
				setData($rootScope.selectedPlace);
				showNearbyPlaces($rootScope.selectedPlace);
			}
			else {
				$http({
					url: '/ajax/places/' + placeId
					, method: 'GET'
				}).success(function (data) {
					if (typeof data == 'object') {
						setData(data);
						showNearbyPlaces(data);
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
});