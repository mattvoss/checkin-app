(function(undefined){
  "use strict";

module.exports = function(grunt) {
  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  var jsSrc = [
        'bower_components/lodash/dist/lodash.js',
        'bower_components/moment/moment.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-aria/angular-aria.js',
        'bower_components/angular-material/angular-material.js',
        'bower_components/angular-moment/angular-moment.js',
        'bower_components/ng-lodash/build/ng-lodash.js',
        'bower_components/angular-material-icons/angular-material-icons.min.js',
        'bower_components/js-data/dist/js-data.js',
        'bower_components/js-data-angular/dist/js-data-angular.js',
        'bower_components/card/lib/js/card.js',
        'bower_components/angular-pdf/dist/angular-pdf.js',
        'bower_components/credit-card-track-parser/lib/credit_card_track_parser.js',
        'bower_components/payment/lib/payment.js',
        'bower_components/angular-ui-mask/dist/mask.js',
        'bower_components/angular-electron/angular-electron.js',
        'bower_components/socket.io-client/dist/socket.io.js'
      ],
      cssSrc = [
        'bower_components/angular-material/angular-material.css',
        'src/css/app.css'
      ];
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: './bower_components',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/js/**/*.js']
    },
    uglify: {
      options: {
        beautify: true,
        mangle: false
      },
      vendors: {
        files: {
          'app/js/vendors.min.js': jsSrc
        }
      },
      app: {
        files: {
          'app/js/app.min.js': [
            'src/js/**/*.js'
          ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'app/css/app.css': cssSrc
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
        dest: 'app/css/app.css',
      },
      app: {
        src: [
          'src/js/**/*.js'
        ],
        dest: 'app/js/app.min.js',
      },
      jsDev: {
        src: jsSrc,
        dest: 'app/js/vendors.min.js',
      },
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'src/templates/*.html'
            ],
            dest: 'app/templates',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'src/main.js'
            ],
            dest: 'app',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'src/js/winSquirrelStartupEventHandler.js'
            ],
            dest: 'app/js',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/pdfjs-dist/build/*.js'
            ],
            dest: 'app/js',
            filter: 'isFile'
          },
          
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
        files: ['src/**/*.js'],
        tasks: ['jshint:all', 'concat:app'],
        options: {
          spawn: true,
        },
      },
      css: {
        files: ['src/css/*.css'],
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
            command: 'electron compiled/'
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
      src: ['./app/**/*'] // Your node-webkit app
    },
    json: {
      data: {
        options: {
          namespace: 'Data',
          includePath: true,
          processName: function(filename) {
            var _name = filename.split("/"),
                len = _name.length-1,
                name = _name[len].split(".")[0];
            return name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
          }
        },
        src: ['src/data/**/*.json'],
        dest: 'app/js/json.js'
      }
    }
  });

  grunt.registerTask('build', [
    'bower:install',
    'jshint:all',
    'uglify',
    'cssmin',
    'copy',
    'json:data'
  ]);

  grunt.registerTask('dev', [
    'bower:install',
    'jshint:all',
    'concat',
    'copy',
    'json:data',
  ]);

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  grunt.registerTask('watch', [ 'run', 'watch' ]);

  // Default task(s).
  grunt.registerTask('default', ['dev']);

};
}());
