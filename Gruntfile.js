(function(undefined){
  "use strict";

module.exports = function(grunt) {
  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  var jsSrc = [
        'lib/lodash/lodash.js',
        'lib/angular-ui-router/angular-ui-router.js',
        'lib/angular-animate/angular-animate.js',
        'lib/angular-aria/angular-aria.js',
        'lib/angular-material/angular-material.js',
        'lib/angular-moment/angular-moment.js',
        'lib/angular-lodash/angular-lodash.js',
        'lib/angular-material-icons/angular-material-icons.min.js',
        'lib/js-data/js-data.js',
        'lib/js-data-angular/js-data-angular.js',
        'lib/card/card.js',
        'lib/angular-pdf/angular-pdf.js',
        'lib/credit-card-track-parser/lib/credit_card_track_parser.js',
        'lib/payment/payment.js'
      ],
      cssSrc = [
        'lib/angular-material/angular-material.css',
        'css/app.css'
      ];
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: './lib',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'js/**/*.js']
    },
    uglify: {
      options: {
        beautify: false,
        mangle: true
      },
      vendors: {
        files: {
          'compiled/js/vendors.min.js': jsSrc
        }
      },
      app: {
        files: {
          'compiled/js/app.min.js': [
            'js/**/*.js'
          ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'compiled/css/app.css': cssSrc
        }
      }
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      css: {
        src: cssSrc,
        dest: 'compiled/css/app.css',
      },
      app: {
        src: [
          'js/**/*.js'
        ],
        dest: 'compiled/js/app.min.js',
      },
      jsDev: {
        src: jsSrc,
        dest: 'compiled/js/vendors.min.js',
      },
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'templates/*.html'
            ],
            dest: 'compiled/templates',
            filter: 'isFile'
          }
        ]
      }
    },
    watch: {
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['build', 'watch'],
        options: {
          spawn: true,
        },
      },
      scripts: {
        files: ['js/**/*.js'],
        tasks: ['jshint:all', 'concat:app'],
        options: {
          spawn: true,
        },
      },
      css: {
        files: ['css/*.css'],
        tasks: ['concat:css'],
        options: {
          spawn: true,
        },
      }
    },
    shell: {
        options: {
            stderr: false
        },
        target: {
            command: 'electron .'
        }
    },
    'node-inspector': {
      default: {}
    },
    nodewebkit: {
      options: {
          platforms: ['win'],
          buildDir: './builds', // Where the build version of my node-webkit app is saved
      },
      src: ['./compiled/**/*'] // Your node-webkit app
    },
  });

  grunt.registerTask('build', [
    'bower:install',
    'jshint:all',
    'uglify',
    'cssmin',
    'copy',
    'nodewebkit'
  ]);

  grunt.registerTask('run', [
    'bower:install',
    'jshint:all',
    'concat',
    'copy',
    'shell'
  ]);

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  grunt.registerTask('watch', [ 'run', 'watch' ]);

  // Default task(s).
  grunt.registerTask('default', ['build']);

};
}());
