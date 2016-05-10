(function(undefined){
  "use strict";

module.exports = function(grunt) {
  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  var jsSrc = [
        'lib/lodash/dist/lodash.js',
        'lib/angular-ui-router/angular-ui-router.js',
        'lib/angular-animate/angular-animate.js',
        'lib/angular-aria/angular-aria.js',
        'lib/angular-material/angular-material.js',
        'lib/angular-moment/angular-moment.js',
        'lib/ng-lodash/ng-lodash.js',
        'lib/angular-material-icons/angular-material-icons.min.js',
        'lib/js-data/js-data.js',
        'lib/js-data-angular/js-data-angular.js',
        'lib/card/card.js',
        'lib/angular-pdf/angular-pdf.js',
        'lib/credit-card-track-parser/lib/credit_card_track_parser.js',
        'lib/payment/payment.js',
        'vendors/socket.io.js'
      ],
      cssSrc = [
        'lib/angular-material/angular-material.css',
        'src/css/app.css'
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
              'lib/pdfjs-dist/*.js'
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
  grunt.registerTask('default', ['build']);

};
}());
