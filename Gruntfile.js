/**
 * Created by goncaloferreira on 08/02/15.
 */
module.exports = function (grunt){

	grunt.initConfig({
		ngAnnotate: {
			options: {
				singleQuotes: true
			},
			app1: {
				files: {
					'public/js/functions-annotated.js': ['public/js/functions.js']
				}
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			my_target: {
				files: {
					'public/js/gcardoso.min.js': [
						'public/js/jquery-2.0.3.min.js',
						'public/js/angular.min.js',
						'public/js/angular-animate.min.js',
						'public/js/angular-sanitize.min.js',
						'public/components/socket.io-client/dist/socket.io.min.js',
						'public/js/form-builder.min.js',
						'public/js/jquery.easing.1.3.js',
						'public/js/functions-annotated.js'
					],
					'public/js/gcardoso-oldie.min.js': [
						'public/js/html5.shiv.js',
						'public/js/jquery-1.10.2.min.js',
						'public/js/angular.min.js',
						'public/js/angular-animate.min.js',
						'public/js/angular-sanitize.min.js',
						'public/components/socket.io-client/dist/socket.io.min.js',
						'public/js/form-builder.min.js',
						'public/js/jquery.easing.1.3.js',
						'public/js/functions-annotated.js'
					]
				}
			}
		},
		cssmin: {
			target: {
				files: {
					'public/css/gcardoso.min.css': ['public/css/icons.css', 'public/css/awwwards.css', 'public/css/style.css']
				},
				options: {
					shorthandCompacting: false,
					roundingPrecision: -1,
					report:'gzip'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['ngAnnotate','uglify','cssmin']);

}