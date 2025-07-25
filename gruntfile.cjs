/*
Copyright - 2017 2023 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

const banner =
    '/**\n * ' +
    '\n * @source: <%= pkg.sources %>\n * ' +
    '\n * @licstart  The following is the entire license notice for the' +
    '\n * JavaScript code in this page.\n * \n * <%= pkg.name %> - version <%= pkg.version %>' +
    '\n * Build <%= build %> - <%= grunt.template.today("isoDateTime") %> ' +
    '\n * Copyright 2024 <%= grunt.template.today("yyyy") %> wwwouaiebe ' +
    '\n * Contact: https://www.ouaie.be/' +
    '\n * License: <%= pkg.license %>' +
    '\n * \n * The JavaScript code in this page is free software: you can' +
    '\n * redistribute it and/or modify it under the terms of the GNU' +
    '\n * General Public License (GNU GPL) as published by the Free Software' +
    '\n * Foundation, either version 3 of the License, or (at your option)' +
    '\n * any later version.  The code is distributed WITHOUT ANY WARRANTY;' +
    '\n * without even the implied warranty of MERCHANTABILITY or FITNESS' +
    '\n * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.' +
    '\n * \n * As additional permission under GNU GPL version 3 section 7, you' +
    '\n * may distribute non-source (e.g., minimized or compacted) forms of' +
    '\n * that code without the copy of the GNU GPL normally required by' +
    '\n * section 4, provided you include this license notice and a URL' +
    '\n * through which recipients can access the Corresponding Source.' +
    '\n * \n * @licend  The above is the entire license notice' +
    '\n * for the JavaScript code in this page.' +
    '\n * \n */\n\n';

module.exports = function ( grunt ) {

	grunt.initConfig ( {
		pkg : grunt.file.readJSON ( 'package.json' ),

		// eslint config

		eslint : {
			options : {
				fix : true,
				overrideConfigFile : 'eslint.config.js'
			},
			target : [ 'src/*/*.js', 'src/*/*/*.js' ]
		},
		essimpledoc : {
			release : {
				options : {
					src : './src',
					dest : './docs/techDoc',
					validate : true
				}
			}
		},
		buildnumber : {
			options : {
				file : 'buildNumber.json'
			},
			start : {
				action : 'read',
				values : [
					{
						name : 'build',
						initialValue : 0,
						transform : value => String ( value ).padStart ( 5, '0' )
					}
				]
			},
			end : {
				action : 'write',
				values : [
					{
						name : 'build',
						initialValue : 0,
						transform : value => value + 1
					}
				]
			}
		},
		essimpledoc : {
			debug : {
				options : {
					src : 'src',
					dest : 'docs/techDoc',
					validate : true,
					noFiles : true
				}
			},
			release : {
				options : {
					src : './src',
					dest : './docs/techDoc',
					validate : true
				}
			}
		},
		rollup : {
			debug : {
				options : {
					format : 'iife'
				},
				files : {
					'tmp/debug/OsmGtfsCompare.min.js' : [ 'src/OsmGtfsCompare/index.js' ]
				}
			},
			release : {
				options : {
					format : 'iife'
				},
				files : {
					'tmp/release/OsmGtfsCompare.min.js' : [ 'src/OsmGtfsCompare/index.js' ]
				}
			}
		},
		terser : {
			debug : {
				options : {
					mangle : true,
					output : {
						preamble : banner
					}
				},
				files : {
					'dist/OsmGtfsCompare/index.js' :
						[ 'tmp/debug/OsmGtfsCompare.min.js' ]
				}
			},
			release : {
				options : {
					mangle : true,
					output : {
						preamble : banner
					}
				},
				files : {
					'dist/OsmGtfsCompare/index.js' :
						[ 'tmp/release/OsmGtfsCompare.min.js' ]
				}
			}

		},
		copy : {
			afterRollup : {
				files : [
					{
						expand : true,
						cwd : 'src/Common/JsonLoader/',
						src : [ 'JsonLoader4NodeAndBrowser.js' ],
						rename : function ( ) { return 'src/Common/JsonLoader.js'; }
					 }
				]
			},
			beforeRollup : {
				files : [
					{
						expand : true,
						cwd : 'src/Common/JsonLoader/',
						src : [ 'JsonLoader4Rollup.js' ],
						rename : function ( ) { return 'src/Common/JsonLoader.js'; }
					 }
				]
			},
			release : {
				files : [

					{ expand : true,
						cwd : 'src/OsmGtfsCompare/dataFiles/operators',
						src : [ '*.json' ],
						dest : 'dist/OsmGtfsCompare/dataFiles/operators/' },
					{ expand : true,
						cwd : 'src/OsmGtfsCompare/dataFiles/json',
						src : [ '*/*.json' ],
						dest : 'dist/OsmGtfsCompare/dataFiles/json/' },
					{ expand : true, cwd : 'src/OsmGtfsCompare/', src : [ 'index.html' ], dest : 'dist/OsmGtfsCompare/' },
					{ expand : true, cwd : 'src/OsmGtfsCompare/', src : [ 'index.css' ], dest : 'dist/OsmGtfsCompare/' },
					{ expand : true, cwd : 'src/Gtfs2json/', src : [ '*.js', '*.bat' ], dest : 'dist/Gtfs2Json/' },
					{ expand : true, cwd : 'src/Common/', src : [ '*.js' ], dest : 'dist/Common/' }
				]
			}
		}

	} );

	grunt.loadNpmTasks ( 'grunt-eslint' );
	grunt.loadNpmTasks ( 'grunt-wwwouaiebe-buildnumber' );
	grunt.loadNpmTasks ( 'grunt-essimpledoc' );
	grunt.loadNpmTasks ( 'grunt-rollup' );
	grunt.loadNpmTasks ( 'grunt-terser' );
	grunt.loadNpmTasks ( 'grunt-contrib-copy' );

	grunt.registerTask (
		'hello',
		'hello',
		function () {
			console.error (
				'\x1b[30;101m Start build of ' +
				grunt.config.data.pkg.name + ' - ' +
				grunt.config.data.pkg.version + ' - ' +
				grunt.template.today ( 'isoDateTime' )
				+ ' \x1b[0m'
			);
		}
	);

	grunt.registerTask (
		'bye',
		'bye',
		function () {
			console.error (
				'\x1b[30;42m ' +
				grunt.config.data.pkg.name + ' - ' +
				grunt.config.data.pkg.version + ' - build: ' +
				grunt.config.data.build + ' - ' +
				grunt.template.today ( 'isoDateTime' ) +
				' done \x1b[0m'
			);
		}
	);

	grunt.registerTask (
		'release',
		[
			'hello',
			'buildnumber:start',
			'eslint',
			'copy:beforeRollup',
			'rollup:release',
			'copy:afterRollup',
			'terser:release',
			'copy:release',
			'essimpledoc:release',
			'buildnumber:end',
			'bye'
		]
	);

	grunt.registerTask (
		'debug',
		[
			'hello',
			'buildnumber:start',
			'essimpledoc:debug',
			'eslint',
			'buildnumber:end',
			'bye'
		]
	);
};