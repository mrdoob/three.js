"use strict";

module.exports = function( grunt ) {

  grunt.initConfig( {
    eslint: {
        target: [
          'src',
          //'examples',   // should turn this on but not yet. Too many errors
          //'test',       // should turn this on. Will need different options, can put in test/.eslistrc
        ],
        options: {
            config: 'utils/build/eslint/eslint.json',
            rulesdir: ['utils/build/eslint/rules'],

            // eslint plugins installed through npm

            plugin: [
            //    'eslint-plugin-optional-comma-spacing',
            //    'eslint-plugin-require-trailing-comma',
            ],
        },
    },
  });

  grunt.loadNpmTasks( 'grunt-eslint' );

  grunt.registerTask( 'default', ['eslint'] );

};

