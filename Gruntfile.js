module.exports = function( grunt ) {

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON( "package.json" ),

		name: "three",

		jshint: {

			options: {

				jshintrc: ".jshintrc"

			},

			gruntfile: { src: "Gruntfile.js" },
			src: { src: "src/*.js" },
			cameras: { src: [ "src/cameras/**/*.js" ] },
			core: { src: [ "src/core/**/*.js" ] },
			extras: { src: [ "src/extras/**/*.js" ] },
			lights: { src: [ "src/lights/**/*.js" ] },
			loaders: { src: [ "src/loaders/**/*.js" ] },
			materials: { src: [ "src/materials/**/*.js" ] },
			math: { src: [ "src/math/**/*.js" ] },
			objects: { src: [ "src/objects/**/*.js" ] },
			renderers: { src: [ "src/renderers/**/*.js" ] },
			scenes: { src: [ "src/scenes/**/*.js" ] },
			textures: { src: [ "src/textures/**/*.js" ] }//,
			//test: { src: [ "test/**/*.js" ] }

		},

		qunit: {

			bundles: [
				"test/unit/unittests_three.html",
				"test/unit/unittests_three.min.html"
			]

		},

		browserify: {

			build: {

				src: [ "src/Three.js" ],

				dest: "build/<%= name %>.js",

				options: {

					banner: "/**\n * <%= name %> v<%= pkg.version %> build <%= grunt.template.today(\"dd.mm.yyyy\") %>\n" +
						" * <%= pkg.homepage %>\n" +
						" * Copyright <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>, <%= pkg.license %>\n */\n",

					browserifyOptions: {

						standalone: "THREE"

					},

					transform: [ "brfs" ]

				}

			}

		},

		uglify: {

			build: {

				options: {

					banner: "<%= browserify.build.options.banner %>",

					mangle: {

						except: [ "<%= browserify.build.options.browserifyOptions.standalone %>" ]

					}

				},

				files: {

					"build/<%= name %>.min.js": [ "<%= browserify.build.dest %>" ]

				}

			}

		},

		clean: {

			build: [ "build/*.js" ]

		}

	} );

	// Plugins.
	grunt.loadNpmTasks( "grunt-browserify" );
	grunt.loadNpmTasks( "grunt-contrib-clean" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-qunit" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );

	// Task definitions.
	grunt.registerTask( "default", [ "jshint", "qunit", "browserify", "uglify" ] );
	grunt.registerTask( "test", [ "jshint", "qunit" ] );
	grunt.registerTask( "build", [ "browserify", "uglify" ] );

};
