module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        // Concatenate files together.
        //----------------------------
        concat : {
            all : {
                files : {
                    'lib/openlayers-animation-<%= pkg.version %>.js' : ['src/**/*.js', '!src/addins/lib/OpenLayers/Layer/Animation/internal/intro.js']
                }
            },
            intro : {
                files : {
                    // "Use strict" definition should be included once to the beginning of the concatenated file.
                    // Notice, combined files may contain their own strict definitions which should be removed in the grunt flow.
                    'lib/openlayers-animation-<%= pkg.version %>.js' : ['src/addins/lib/OpenLayers/Layer/Animation/internal/intro.js', 'lib/openlayers-animation-<%= pkg.version %>.js']
                }
            }
        },

        // Minimize JavaScript for release.
        //---------------------------------
        uglify : {
            all : {
                files : [{
                    dest : 'lib/openlayers-animation-<%= pkg.version %>-min.js',
                    src : ['lib/openlayers-animation-<%= pkg.version %>.js']
                }]
            }
        },

        // Clean build files or folders.
        //------------------------------
        clean : {
            onlyFiles : {
                src : ['lib/**'],
                filter : 'isFile'
            },
            // Notice, removal of directories may corrupt svn structure.
            // Therefore, be carefull if this is set as default command.
            all : ['lib/']
        },

        // Detect errors and potential problems in JavaScript code and enforce coding conventions.
        //----------------------------------------------------------------------------------------
        jshint : {
            all : ['src/**/*.js', 'lib/openlayers-animation-<%= pkg.version %>.js'],
            options : {
                "curly" : true,
                "eqeqeq" : true,
                "immed" : true,
                "latedef" : true,
                "newcap" : true,
                "noarg" : true,
                "sub" : true,
                "undef" : true,
                "boss" : true,
                "eqnull" : true,
                "node" : true,
                "globals" : {
                    "window" : true,
                    "document" : true,
                    "Element" : true,
                    "OpenLayers" : true,
                    "fi" : true,
                    "requestAnimationFrame" : true
                }
            }
        },

        // Replace strings inside files.
        //------------------------------
        "string-replace" : {
            // Make sure proper version number is used in source file paths of HTML files.
            // Notice, these HTML files are meant to be run separately by hand, not automatically by Grunt.
            // Notice, src files do not contain version in filename. They can be ignored here.
            version : {
                files : [{
                    dest : 'examples/index.html',
                    src : ['examples/index.html']
                }],
                options : {
                    replacements : [{
                        pattern : /openlayers-animation-.+-min\./g,
                        replacement : 'openlayers-animation-<%= pkg.version %>-min.'
                    }]
                }
            },
            // "Use strict" definition should be included once to the beginning of the concatenated file.
            // Combined files may contain their own strict definitions which should be removed in the grunt flow.
            useStrict : {
                files : [{
                    dest : 'lib/openlayers-animation-<%= pkg.version %>.js',
                    src : ['lib/openlayers-animation-<%= pkg.version %>.js']
                }],
                options : {
                    replacements : [{
                        pattern : /"use strict";/gi,
                        replacement : '// "use strict";'
                    }]
                }
            }
        }
    });

    // Load the plugins that provide the required tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-string-replace');

    // Update version strings inside files.
    grunt.registerTask('string-replace-versions', ['string-replace:animation']);

    // Build MetOLib.
    // Notice, combined file is purged of strict definition lines and then strict definition is included to the beginning of the file before uglifying.
    grunt.registerTask('build', ['clean:onlyFiles', 'concat:all', 'string-replace:useStrict', 'concat:intro', 'uglify', 'string-replace:version']);

    // Default task(s).
    // As a default, only local data is used for tests. Then, tests can be run also without connection for server data.
    // Notice, test can be run separately also for server data.
    grunt.registerTask('default', ['build', 'jshint']);

};
