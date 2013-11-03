//python build.py --include common --include extras --output ../../build/three.js
//python build.py --include common --include extras --minify --output ../../build/three.min.js
//python build.py --include canvas --minify --output ../../build/three-canvas.min.js
//python build.py --include css3d --minify --output ../../build/three-css3d.min.js
//python build.py --include webgl --minify --output ../../build/three-webgl.min.js
//python build.py --include extras --externs externs/extras.js --minify --output ../../build/three-extras.min.js
//python build.py --include math --output ../../build/three-math.js
//python build.py --include math --minify --output ../../build/three-math.min.js

module.exports = function (grunt) {
	var common = grunt.file.readJSON('utils/build/includes/common.json'),
		extras = grunt.file.readJSON('utils/build/includes/extras.json'),
		canvas = grunt.file.readJSON('utils/build/includes/canvas.json'),
		css3d = grunt.file.readJSON('utils/build/includes/css3d.json'),
		webgl = grunt.file.readJSON('utils/build/includes/webgl.json'),
		math = grunt.file.readJSON('utils/build/includes/math.json');

	grunt.initConfig({
		concat: {
			common: {
				src: common.concat(extras),
				dest: 'build/three.js'
			},
			canvas: {
				src: canvas,
				dest: 'build/three-canvas.js'
			},
			css3d: {
				src: css3d,
				dest: 'build/three-css3d.js'
			},
			webgl: {
				src: webgl,
				dest: 'build/three-webgl.js'
			},
			extras: {
				src: ['utils/build/externs/extras.js'].concat(extras),
				dest: 'build/three-extras.js'
			},
			math: {
				src: math,
				dest: 'build/three-math.js'
			},
			max: {
				src: ['utils/build/externs/examples.js'].concat(common, extras),
				dest: 'build/three-max.js'
			}
		},

		uglify: {
			common: {
				files: {
					'build/three.min.js': 'build/three.js'
				}
			},
			canvas: {
				files: {
					'build/three-canvas.min.js': 'build/three-canvas.js'
				}
			},
			css3d: {
				files: {
					'build/three-css3d.min.js': 'build/three-css3d.js'
				}
			},
			webgl: {
				files: {
					'build/three-webgl.min.js': 'build/three-webgl.js'
				}
			},
			extras: {
				files: {
					'build/three-extras.min.js': 'build/three-extras.js'
				}
			},
			math: {
				files: {
					'build/three-math.min.js': 'build/three-math.js'
				}
			},
			max: {
				files: {
					'build/three-max.min.js': 'build/three-max.js'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['build:common']);
	grunt.registerTask('build:common', ['concat:common', 'uglify:common']);
	grunt.registerTask('build:canvas', ['concat:canvas', 'uglify:canvas']);
	grunt.registerTask('build:css3d', ['concat:css3d', 'uglify:css3d']);
	grunt.registerTask('build:webgl', ['concat:webgl', 'uglify:webgl']);
	grunt.registerTask('build:extras', ['concat:extras', 'uglify:extras']);
	grunt.registerTask('build:math', ['concat:math', 'uglify:math']);
	grunt.registerTask('build:max', ['concat:max', 'uglify:max']);
	grunt.registerTask('build:all', ['build:common', 'build:canvas', 'build:css3d', 'build:webgl', 'build:extras', 'build:math', 'build:max']);
};