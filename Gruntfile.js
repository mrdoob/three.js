/*eslint-env node*/

'use strict';

const fs = require('fs');
const path = require('path');
const semver = require('semver');

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

  grunt.task.registerMultiTask('fixthreepaths', 'fix three paths', function() {
    const options = this.options({});
    const oldVersionRE = new RegExp(`/${options.oldVersionStr}/`, 'g');
    const newVersionReplacement = `/${options.newVersionStr}/`;
    this.files.forEach((files) => {
      files.src.forEach((filename) => {
        const oldContent = fs.readFileSync(filename, {encoding: 'utf8'});
        const newContent = oldContent.replace(oldVersionRE, newVersionReplacement);
        if (oldContent !== newContent) {
          grunt.log.writeln(`updating ${filename} to ${options.newVersionStr}`);
          fs.writeFileSync(filename, newContent);
        }
      });
    });
  });

  grunt.registerTask('bumpthree', function() {
    const lessonInfo = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf8'}));
    const oldVersion = lessonInfo.threejsfundamentals.threeVersion;
    const oldVersionStr = `r${oldVersion}`;
    const threePath = path.join(__dirname, '..', 'three.js');
    const threeInfo = JSON.parse(fs.readFileSync(path.join(threePath, 'package.json'), {encoding: 'utf8'}));
    const newVersion = semver.minor(threeInfo.version);
    const newVersionStr = `r${newVersion}`;
    const basePath = path.join('threejs', 'resources', 'threejs', newVersionStr);
    grunt.config.merge({
      copy: {
        threejs: {
          files: [
            { expand: true, cwd: `${threePath}/build/`, src: 'three.js', dest: `${basePath}/`, },
            { expand: true, cwd: `${threePath}/build/`, src: 'three.min.js', dest: `${basePath}/`, },
            { expand: true,  cwd: `${threePath}/examples/js/`, src: '**', dest: `${basePath}/js/`, },
          ],
        },
      },
      fixthreepaths: {
        options: {
          oldVersionStr,
          newVersionStr,
        },
        src: [
          'threejs/**/*.html',
          'threejs/**/*.md',
          'threejs/**/*.js',
          '!threejs/resources/threejs/**',
        ],
      },
    });

    lessonInfo.threejsfundamentals.threeVersion = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(lessonInfo, null, 2));
    grunt.task.run(['copy:threejs', 'fixthreepaths']);
  });

  grunt.registerTask('build', ['clean', 'copy:main', 'buildlessons']);

  grunt.registerTask('default', ['eslint', 'build']);
};

