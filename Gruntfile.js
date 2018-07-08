/*eslint-env node*/

'use strict';

const fs = require('fs');

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  const s_ignoreRE = /\.(md|py|sh|enc)$/i;
  function noMds(filename) {
    return !s_ignoreRE.test(filename);
  }

  function notFolder(filename) {
    return !fs.statSync(filename).isDirectory();
  }

  function noMdsNoFolders(filename) {
    return noMds(filename) && notFolder(filename);
  }

  grunt.initConfig({
    eslint: {
      lib: {
        src: [
          'threejs/resources/*.js',
        ],
      },
      support: {
        src: [
          'Gruntfile.js',
          'build/js/build.js',
        ],
      },
      examples: {
        src: [
          'threejs/*.html',
          'threejs/lessons/resources/*.js',
          '!threejs/lessons/resources/prettify.js',
          'threejs/lessons/resources/*.html',
        ],
      },
    },
    copy: {
      main: {
        files: [
          { expand: false, src: '*', dest: 'out/', filter: noMdsNoFolders, },
          { expand: true, src: 'threejs/**', dest: 'out/', filter: noMds, },
          { expand: true, src: 'monaco-editor/**', dest: 'out/', },
          { expand: true, src: '3rdparty/**', dest: 'out/', },
        ],
      },
    },
    clean: [
      'out/**/*',
    ],
  });

  grunt.registerTask('buildlessons', function() {
    const buildStuff = require('./build/js/build');
    const finish = this.async();
    buildStuff().then(function() {
        finish();
    }).done();
  });

  grunt.registerTask('build', ['clean', 'copy', 'buildlessons']);

  grunt.registerTask('default', ['eslint', 'build']);
};

