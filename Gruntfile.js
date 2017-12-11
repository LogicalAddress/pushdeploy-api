'use strict';
require('dotenv').config(/*{path:__dirname+'/../../.env'}*/);
module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'server.js'
      }
    },
    shell: {
      jasmine: {
        command: 'jasmine --stop-on-failure',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true,
        }
      }
    },
    jshint: {
      options: {
        multistr: true,
        esnext: true
      },
      all: ['routes/**/*js', 'lib/**/*.js', 'models/**/*.js', 'middlewares/**/*.js', 'config/**/*.js','listeners/**/*.js','spec/**/*.js']
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      js: {
        files: [
          'server.js',
          'routes/**/*.js',
          'config/**/*.js',
          'listeners/**/*.js',
          'lib/**/*.js',
          'models/**/*.js',
          'spec/**/*.js',
          'middlewares/**/*.js'
        ],
        tasks: ['develop', 'jshint']
      },
    }
  });

  grunt.config.requires('watch.js.files');
  files = grunt.config('watch.js.files');
  files = grunt.file.expand(files);

  grunt.registerTask('default', [
    'develop',
    'watch'
  ]);

  grunt.registerTask('test', ['jshint', 'shell:jasmine']);
};