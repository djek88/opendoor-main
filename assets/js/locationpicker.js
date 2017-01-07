/**
 * Created by Vavooon on 22.12.2015.
 */
define(['libs/googlemaps'], function () {
	$.fn.locationpicker = function () {
		var geocoder = new google.maps.Geocoder();

		var $rootEl = this;
		var $inputEl = $('.location-picker-address', this);
		var $coordsEl = $('.location-picker-location', this);
		var $autoDetectEl = $('.location-picker-detect-button', this);
		var $resultsEl = $('<div class="location-picker-results"></div>');

		var location = null;
		var typingDelay = 600;
		var delay = (function () {
			var timer = 0;
			return function (callback, ms) {
				clearTimeout(timer);
				timer = setTimeout(callback, ms);
			};
		})();

		function showResults() {
			$rootEl.addClass('location-picker-active');
			var offset = $inputEl.offset();
			$resultsEl.css('top', offset.top + $inputEl.outerHeight());
			$resultsEl.css('left', offset.left);
			$resultsEl.css('width', $inputEl.parent().outerWidth());
			$(document.body).append($resultsEl);
		}

		function removeResults() {
			$rootEl.removeClass('location-picker-active');
			$resultsEl.remove();
		}

		function setLocation(newLocation) {
			if (newLocation && newLocation.geometry) {
				location = newLocation;
				$inputEl.val(location.formatted_address);
				var locationArray = [location.geometry.location.lng(), location.geometry.location.lat()];
				if ($coordsEl) {
					$coordsEl.val(locationArray.join(', '));
				}
			}
			else {
				location = null;
				$inputEl.val('');
				if ($coordsEl) {
					$coordsEl.val('');
				}
			}
			$inputEl.trigger("change");
			$coordsEl.trigger("change");
		}


		function blur(e) {
			if (e.target != $inputEl[0]) {
				$(document).off('click', blur);
				$inputEl.attr('active', 0);
				if (e.target.className != 'location-picker-result' && $resultsEl.children().length) {
					$resultsEl.children().first().click();
				}
				else if (e.target.className != 'location-picker-result') {
					setLocation();
				}
				removeResults();
			}
		}

		function loadResults() {
			$(document).off('click', blur);
			$inputEl.attr('active', 1);
			var value = $inputEl.val();
			if (value) {
				geocoder.geocode({'address': value}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						$resultsEl.empty();
						for (var i = 0; i < results.length; i++) {
							var $result = $('<div class="location-picker-result">' + results[i].formatted_address + '</div>');
							$result[0].location = results[i];
							$result.click(function () {
								setLocation(this.location);
							});
							$resultsEl.append($result);
						}
						showResults();
						$(document).on('click', blur);
					}
				});
			}
			else {
				setLocation();
				removeResults();
			}
		}

		$inputEl.keyup(function (e) {
			if (e.which == 13) {
				e.stopPropagation();
				loadResults();
			}
			else {
				delay(loadResults, typingDelay);
			}
		});


		function onPositionReceive(location) {
			var latlng = {lat: location.coords.latitude, lng: location.coords.longitude};
			geocoder.geocode({'location': latlng}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					setLocation(results[0]);
				}
			});
		};

		function showError(error) {
			var errorMessage;
			switch (error.code) {
				case error.PERMISSION_DENIED:
					errorMessage = "User denied the request for Geolocation.";
					break;
				case error.POSITION_UNAVAILABLE:
					errorMessage = "Location information is unavailable.";
					break;
				case error.TIMEOUT:
					errorMessage = "The request to get user location timed out.";
					break;
				case error.UNKNOWN_ERROR:
					errorMessage = "An unknown error occurred.";
					break;
			}
		};


		function getLocationFromBrowser(e) {
			if (e.clientX) {
				if (navigator.geolocation) {
					$inputEl.val('Detecting Location…');
					navigator.geolocation.getCurrentPosition(onPositionReceive, showError);
				}
				else {
					$scope.error = "Geolocation is not supported by this browser.";
				}
			}
			return false;
		}
		
		function getAutoLocationFromBrowser() {
			if (navigator.geolocation) {
				$inputEl.val('Detecting Location…');
				navigator.geolocation.getCurrentPosition(onPositionReceive, showError);
			}
			else {
				$scope.error = "Geolocation is not supported by this browser.";
			}
		}
		
		$inputEl.focus(loadResults);
		$autoDetectEl.click(getLocationFromBrowser);
		if ($coordsEl.val == '') getAutoLocationFromBrowser();
	};
});