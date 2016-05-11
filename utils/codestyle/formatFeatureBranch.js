#!/usr/bin/env node
'use strict';

var exec = require( 'child_process' ).exec;
var async = require( 'async' );
var path = require( 'path' );
var fs = require( 'fs' );
var util = require( 'util' );
var EventEmitter = require( 'events' );

var ArgumentParser = require( 'argparse' ).ArgumentParser;
var cli = new ArgumentParser( {
	version: '0.0.1',
	addHelp: true,
	description: 'Run auto-formatter on lines that have changed between dev and the current branch'
} );

var SCRIPT_DIR = __dirname;
var BASE_DIR = path.resolve( SCRIPT_DIR, '../../' );
var DIFF_FILENAME = 'formatting.diff';

var execOptions = { cwd: BASE_DIR, shell: '/bin/bash' };

// call chunks overlapping if either endpoint of one lies within the other
function chunksOverlap(a, b) {
	if ( ( a.start > b.start && a.start < b.end ) ||
	     ( a.end > b.start && a.end < b.end ) ) {
		return true;
	}
	return false;
}

function DiffReader( diffOutput, options ) {
	EventEmitter.call( this );
	this.lines = diffOutput.split('\n');

	this.options = options || {};
}
util.inherits(DiffReader, EventEmitter);

DiffReader.prototype.read = function() {

	var self = this;

	// ensure read method returns immediately
	process.nextTick( function() {

		var curFile = null;

		self.lines.forEach( function( line ) {

			if ( /^diff/.test( line ) ) {

				var fileName = line.split( ' ' )[ 3 ];
				fileName = fileName.replace( /^[ab]\//, '' );
				self.emit( 'file', fileName ) ;

			} else if ( /^@@.*@@/.test( line ) ) {

				var tokens = line.split( ' ' );

				// remove leading '+' from line num pair
				var newChunk = tokens[ 2 ].substring( 1 );
				var lineNums = newChunk.split( ',' );
				var chunk = { start: lineNums[ 0 ], end: lineNums[ 1 ] };

				self.emit( 'chunk', chunk );

			}

			// After emitting parse state events, emit line to be processed
			self.emit('line', line)

		} );

		self.emit('end');

	} );
}

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

				if ( err || stderr.trim() ) {

					return done( err || stderr.trim() );

				}

				var result = {};
				var curFile = null;

				var diffReader = new DiffReader( stdout )
					.on( 'file', function( filePath ) {

						if ( /\.js$/.test(filePath) ) {

							console.log('file: ' + filePath);
							curFile = filePath;
							result[curFile] = [];

						} else {

							curFile = null;

						}

					} )
					.on( 'chunk', function( chunk ) {

						if ( curFile ) {

							console.log('  ' + chunk.start + ',' + chunk.end );
							result[ curFile ].push( chunk );

						}

					} )
					.on( 'end', function() {

						console.log( "modified files/lines" );

						for ( var file in result ) {

							console.log( file );
							result[ file ].forEach( function( chunk ) {

								console.log( '  ' + chunk.start + ',' + chunk.end );

							} );

						}

						self.featuredModifiedLines = result;
						return done( null, result );

					})
					.on( 'error', done )
					.read();

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

					if ( err || stderr.trim() ) {

						console.log( stdout.trim() );
						console.log( stderr.trim() );

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

		var self = this;
		var changes = this.featuredModifiedLines;

		async.seq(
			function(_, cb) {

				// run git diff
				// filter diff output to only include chunks modified by feature
				exec(
					'git --no-pager diff',
					execOptions,
					function( err, stdout, stderr ) {

						var curFile,
							curFileChunks = [],
							includeChunk = false;

						var filteredDiff = [];

						var diffReader = new DiffReader( stdout );
						diffReader
							.on('file', function( filePath ) {

								if ( filePath in changes ) {

									curFile = filePath;
									curFileChunks = changes[ curFile ];

								} else {

									curFile = null;

								}

							} )
							.on( 'chunk', function( chunk ) {
								if ( curFile ) {
									for ( var i = 0; i < curFileChunks.length; i ++ ) {
										if (chunksOverlap( chunk, curFileChunks[i] )) {
											includeChunk = true;
											return;
										}
									}
									includeChunk = false;
								} else {
									includeChunk = false;
								}
							} )
							.on( 'line', function( line ) {

								// ensure header lines for files are always kept
								if ( /^(diff|index|---|\+\+\+)/.test(line) ) {
									filteredDiff.push( line );
								} else if (curFile && includeChunk) {

									filteredDiff.push( line );

								}

							} )
							.on( 'error', done )
							.on( 'end', function() {
								cb( null, filteredDiff.join('\n') );
							} )
							.read();
					}
				);
			},
			function(filteredDiff, cb) {

				// save to file
				fs.writeFile(
					path.resolve(BASE_DIR, DIFF_FILENAME),
					filteredDiff, { encoding: 'utf8' }, cb );

			}
		)(null, done);

	},

	resetChanges: function( done ) {

		console.log( 'Reverting changes made by formatter...' );

		exec(
			'git checkout -- .',
			execOptions,
			function( err, stdout, stderr ) {
				if ( err || stderr.trim() ) {
					return done ( err || stderr.trim() );
				}
				done();
			}
		);

	},

	applyPatch: function( done ) {

		console.log('Applying filtered patch to format only modified lines...');

		exec(
			'git apply ' + DIFF_FILENAME,
			execOptions,
			function( err, stdout, stderr ) {
				if ( err || stderr.trim() ) {
					return done( err || stderr.trim() );
				}

				fs.unlink(path.resolve(BASE_DIR, DIFF_FILENAME), done);
			}
		);

	},

	formatFeatureBranch: function( done ) {

		async.series( [
			this.confirmNoUncomittedChanges.bind( this ),
			this.determineCurrentBranch.bind( this ),
			this.determineFeatureModifiedFilesAndLines.bind( this ),
			this.runFormatter.bind( this ),
			this.generateFilteredPatch.bind( this ),
			this.resetChanges.bind( this ),
			this.applyPatch.bind( this )
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

