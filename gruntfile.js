'use strict';

module.exports = function(grunt) {

	var basicUrl = 'http://localhost:8000';

	// This file removes unused CSS
	/*
		It uses some hardcoded URLs like place, jobs or users IDs
		It also uses login and password in order to login and render admin pages
	 */


	var pages = {
		placeSearch: '/'
		, login: '/login'
		, register: '/register'
		, placeSearchResults: '/?lat=50.0145025&lng=22.67505069999993'
		, placeView: '/places/Poland/Podkarpackie/Jaroslaw/Christianity/RCCG/Ku-Klux-Klan'
		, placeWithPhotoView: '/places/England/Hampshire/Hampshire/Christianity/RCCG/Agape-Centre-Havant'
		, placeEdit: '/places/edit/56fba871316dc2e574e83118'
		, placeReview: '/places/review/56ceff0eb39de24eeb0bb676'
		, placeAdd: '/places/add'
		, placeAddEvent: '/places/event/56ceff0eb39de24eeb0bb676/add'
		, placeAddJob: '/jobs/add?place=56ceff0eb39de24eeb0bb676'
		, placesMaintained: '/places/maintained'
		, placesChanges: '/places/changes'
		, placesList: '/places/list'
		, placesClaims: '/places/claims'
		, usersList: '/users/list'
		, userView: '/users/56bf7a610551412f205f1407'
		, placesListByLocality: '/places/Albania/Tiran%C3%AB/'
		, jobView: '/jobs/56fba718316dc2e574e83117'
		// , jobEdit: '/jobs/56fba718316dc2e574e83117/edit'
		, message: '/message?message=verifysubscription&back=/'
		, error: '/error'
		, about: '/about'
	};

	var cookie = '';

	var distFiles = [];

	var config = {
		http: {
			loginPost: {
				options: {
					url: basicUrl + '/login'
					, method: 'POST'
					, form: {
						email: 'vavooon@gmail.com'
						, password: 'mazafaka'
					}
					, jar: true
					, callback: function(err, response) {
						var cookies = response.headers['set-cookie'];

						for (var i=0; i < cookies.length; i++) {
							cookie += cookies[i].substr(0, cookies[i].indexOf('; ') + 2);
						}
					}
				}
				// , dest: 'temp/login2.html'
			}
		}
		, uncss: {
			options: {
				csspath: '../'
			}
			, dist: {
				files: [
					{
						src: distFiles
						, dest: 'assets/css/tidy.css'
					}
				]
			}
		}
	};


	for (var i in pages) {
		if (pages.hasOwnProperty(i)) {
			distFiles.push('temp/' + i + '.html');
			config.http[i] = {
				options: {
					url: basicUrl + pages[i] + (pages[i].indexOf('?') != -1 ? '&' : '?') + 'originalCss=true&disableLoginRedirect=true'
					, headers: {
						'User-Agent': 'twitterbot'
						, 'Cookie': cookie
					}
					, jar: true
				}
				, dest: 'temp/' + i + '.html'
			}
		}
	}

	grunt.initConfig(config);

	grunt.loadNpmTasks('grunt-http');
	grunt.loadNpmTasks('grunt-uncss');
	grunt.registerTask('default', ['http', 'uncss']);

};

