/*eslint-env node*/

'use strict';

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const liveEditor = require('@gfxfundamentals/live-editor');
const liveEditorPath = path.dirname(require.resolve('@gfxfundamentals/live-editor'));

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  const s_ignoreRE = /\.(md|py|sh|enc)$/i;
  function noMds(filename) {
    return !s_ignoreRE.test(filename);
  }

  const s_isMdRE = /\.md$/i;
  function mdsOnly(filename) {
    return s_isMdRE.test(filename);
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
          { expand: true, cwd: `${liveEditor.monacoEditor}/`, src: 'min/**', dest: 'out/monaco-editor/', nonull: true, },
          { expand: true, cwd: `${liveEditorPath}/src/`, src: '**', dest: 'out/threejs/resources/', nonull: true, },
          { expand: true, src: 'threejs/**', dest: 'out/', filter: noMds, },
          { expand: true, src: '3rdparty/**', dest: 'out/', },
        ],
      },
    },
    clean: [
      'out/**/*',
    ],
    buildlesson: {
      main: {
        files: [],
      },
    },
    watch: {
      main: {
        files: [
          'threejs/**',
          '3rdparty/**',
          'node_modules/@gfxfundamentals/live-editor/src/**',
        ],
        tasks: ['copy'],
        options: {
          spawn: false,
        },
      },
      lessons: {
        files: [
          'threejs/lessons/**/threejs*.md',
        ],
        tasks: ['buildlesson'],
        options: {
          spawn: false,
        },
      },
    },
  });

  let changedFiles = {};
  const onChange = grunt.util._.debounce(function() {
    grunt.config('copy.main.files', Object.keys(changedFiles).filter(noMds).map((file) => {
      const copy = {
        src: file,
        dest: 'out/',
      };
      if (file.indexOf('live-editor') >= 0) {
        copy.cwd = `${path.dirname(file)}/`;
        copy.src = path.basename(file);
        copy.expand = true;
        copy.dest = 'out/webgl/resources/';
      }
      return copy;
    }));
    grunt.config('buildlesson.main.files', Object.keys(changedFiles).filter(mdsOnly).map((file) => {
      return {
        src: file,
      };
    }));
    changedFiles = {};
  }, 200);
  grunt.event.on('watch', function(action, filepath) {
    changedFiles[filepath] = action;
    onChange();
  });

  const buildSettings = {
    outDir: 'out',
    baseUrl: 'http://threejsfundamentals.org',
    rootFolder: 'threejs',
    lessonGrep: 'threejs*.md',
    siteName: 'ThreeJSFundamentals',
    siteThumbnail: 'threejsfundamentals.jpg',  // in rootFolder/lessons/resources
    templatePath: 'build/templates',
  };

  // just the hackiest way to get this working.
  grunt.registerMultiTask('buildlesson', 'build a lesson', function() {
    const filenames = new Set();
    this.files.forEach((files) => {
      files.src.forEach((filename) => {
        filenames.add(filename);
      });
    });
    const buildStuff = require('@gfxfundamentals/lesson-builder');
    const settings = Object.assign({}, buildSettings, {
      filenames,
    });
    const finish = this.async();
    buildStuff(settings).finally(finish);
  });

  grunt.registerTask('buildlessons', function() {
    const buildStuff = require('@gfxfundamentals/lesson-builder');
    const finish = this.async();
    buildStuff(buildSettings).finally(finish);
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
  grunt.registerTask('buildwatch', ['build', 'watch']);

  grunt.registerTask('default', ['eslint', 'build']);
};

