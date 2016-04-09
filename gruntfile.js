/**
 * Created by vavooon on 30.03.16.
 */
'use strict';
module.exports = function(grunt) {

	var config = {
		uncss: {
			options: {
				urls: [ 'http://localhost:8000/', 'http://myapp/#/bar' ]
			},
			dist: {
				files: [
					// 'assets/css/tidy.css': ['http://localhost/']
					{
						src: ['http://localhost/']
						, dest: 'assets/css/tidy.css'
					}
				]
			}
		}
	};

	grunt.initConfig(config);
	console.log(config.uncss.dist.files);

	grunt.loadNpmTasks('grunt-uncss');
	// grunt.registerTask('default', ['uncss']);

};

