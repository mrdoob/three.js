#!/usr/bin/env node
'use strict';

var exec = require( 'child_process' ).exec;
var async = require( 'async' );
var path = require( 'path' );

var ArgumentParser = require( 'argparse' ).ArgumentParser;
var cli = new ArgumentParser( {
	version: '0.0.1',
	addHelp: true,
	description: 'Run auto-formatter on lines that have changed between dev and the current branch'
} );

var SCRIPT_DIR = __dirname;
var BASE_DIR = path.resolve( SCRIPT_DIR, '../../' );

var execOptions = { cwd: BASE_DIR, shell: '/bin/bash' };

// Use a class so we can store intermediate data in `this`
function FeatureFormatter( args ) {

	this.args = args;

}

FeatureFormatter.prototype = {
	constructor: FeatureFormatter,

	confirmNoUncomittedChanges: function( done ) {

		console.log( 'Confirming you have no uncommitted changes...' );

		exec(
			'git status -s | grep --no-messages -E "^[^?]{2}" --color=never',
			execOptions,
			function( err, stdout, stderr ) {

				if ( err ) {

					// grep returns error code if no matches found
					return done();

				} else if ( stderr.trim() ) {

					return done( new Error( 'error output from git status: ' + stderr ) );

				} else if ( stdout.trim() ) {

					return done( new Error( 'you have uncommitted changes\n' + stdout.trim() ) );

				}

				done();

			}

		);

	},

	determineCurrentBranch: function( done ) {

		console.log( 'Getting current branch name...' );

		var self = this;
		exec(
			'git rev-parse --abbrev-ref HEAD',
			execOptions,
			function( err, stdout, stderr ) {

				if ( err || stderr.trim() ) {

					return done( err || stderr.trim() );

				}

				self.featureBranchName = stdout.trim();
				console.log( 'Current branch: ' + self.featureBranchName );

				return done( null, self.featureBranchName );

			}

		);

	},

	// generates object representing changed files and line numbers
	// keys are changed files, relative to base dir
	// values are arrays of line range objects
	determineFeatureModifiedFilesAndLines: function( done ) {

		console.log( 'Determining files and lines modified by feature branch...' );

		var self = this;
		exec(
			'git --no-pager diff dev..' + this.featureBranchName,
			execOptions,
			function( err, stdout, stderr ) {

				// formatter will complain if some style errors are not addressed
				if ( err || stderr.trim() ) {

					console.log( stderr.trim() );

				}

				var result = {};
				var curFile = null;

				stdout.split( '\n' ).filter( function( line ) {

					return /^(diff|index|---|\+\+\+|@@)/.test( line );

				}

				).forEach( function( line ) {

					if ( /^\+\+\+/.test( line ) ) {

						if ( /\.js$/.test( line ) ) {

							curFile = line.split( ' ' )[ 1 ];
							if ( ! ( curFile in result ) ) {

								console.log( '  file diff: ' + curFile );
								result[ curFile ] = [];

							}

						} else {

							// skip this file
							curFile = null;

						}

					} else if ( /^@@.*@@$/.test( line ) ) {

						if ( curFile ) {

							var tokens = line.split( ' ' );

							// remove leading '+' from line num pair
							var newChunk = tokens[ 2 ].substring( 1 );

							var lineNums = newChunk.split( ',' );

							var chunk = { start: lineNums[ 0 ], end: lineNums[ 1 ] };
							result[ curFile ].push( chunk );

						}

					}

				}

				);

				console.log( "modified files/lines" );
				console.log( JSON.stringify( result, null, 2 ) );
				for ( var file in result ) {

					console.log( file );
					result[ file ].forEach( function( chunk ) {

						console.log( '  ' + chunk.start + ',' + chunk.end );

					}

					);

				}

				self.featuredModifiedLines = result;
				return done( null, result );

			}

		);

	},

	runFormatter: function( done ) {

		console.log( 'Executing formatter script on feature-modified files...' );

		var files = Object.keys( this.featuredModifiedLines );
		async.each( files, function( file, cb ) {

			// strip leading 'a/' or 'b/' inserted by git from file path
			file = file.replace( /^[ab]\//, '' );

			console.log( '  ' + file );
			exec(
				'./utils/codestyle/codestyle.sh ' + file,
				execOptions,
				function( err, stdout, stderr ) {

					if ( err || stdout.trim() ) {

						return cb( err || stdout.trim() );

					}

					return cb();

				}

			);

		}

			, function( err ) {

				if ( err ) {

					return done( err );

				}
				done();

			}

		);

	},

	generateFilteredPatch: function( done ) {

		console.log( 'Generating patch of selected formatting changes...' );

	},

	resetChanges: function( done ) {

		console.log( 'Reverting changes made by formatter...' );

	},

	applyPatch: function( done ) {},

	formatFeatureBranch: function( done ) {

		async.series( [
			this.confirmNoUncomittedChanges.bind( this ),
			this.determineCurrentBranch.bind( this ),
			this.determineFeatureModifiedFilesAndLines.bind( this ),
			this.runFormatter.bind( this ),
		// this.generateFilteredPatch.bind( this ),
		// this.resetChanges.bind( this ),
		// this.applyPatch.bind( this )
		], done );

	}
};

if ( require.main === module ) {

	var args = cli.parseArgs();
	var formatter = new FeatureFormatter( args );

	formatter.formatFeatureBranch( function( err, result ) {

		if ( err ) {

			console.log( 'ERROR' );
			console.log( err );

		} else {

			console.log( '\nDone' );

		}

	}

	);

}

