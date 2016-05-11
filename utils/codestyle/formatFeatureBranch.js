#!/usr/bin/env node
'use strict';

var exec = require( 'child_process' ).exec;
var async = require( 'async' );
var path = require( 'path' );

var ArgumentParser = require('argparse').ArgumentParser;
var cli = new ArgumentParser({
	version: '0.0.1',
	addHelp: true,
	description: 'Run auto-formatter on lines that have changed between dev and the current branch'
})

var SCRIPT_DIR = __dirname;
var BASE_DIR = path.resolve(SCRIPT_DIR, '../../');

// Use a class so we can store intermediate data in `this`
function FeatureFormatter(args) {
	this.args = args
}
FeatureFormatter.prototype = {
	constructor: FeatureFormatter,

	generateFilteredPatch: function( done ) {

		console.log( 'Generating patch of selected formatting changes...' );

	},

	runFormatter: function( done ) {

		console.log( 'Executing formatter script on feature-modified files...' );
		var files = Object.keys( featureChanges );

		// TODO: stub
		return done();

	},

	// generates object representing changed files and line numbers
	// keys are changed files, relative to base dir
	// values are arrays of line range objects
	determineFeatureModifiedFilesAndLines: function( done ) {

		console.log( 'Determining files and lines modified by feature branch...' );
		// TODO: stub
		return done( null, {
			'src/examples/Box2.js': [
				{ start: 2,  end: 8 },
				{ start: 12, end: 18 }
			]
		});

	},

	resetChanges: function ( done ) {

		console.log( 'Reverting changes made by formatter...' );

	},

	confirmNoUncomittedChanges: function ( done ) {

		console.log( 'Confirming you have no uncommitted changes...' );

		exec(
			'git status -s | grep -E "^[^?]{2}" --color=never',
			{ cwd: BASE_DIR },
			function( err, stdout, stderr ) {

				console.log(stdout)

				if ( err ) {

					return done( new Error( 'error with git status: ' + err ) );

				} else if ( stderr.trim() ) {

					return done( new Error( 'error output from git status: ' + stderr ) );

				} else if ( stdout.trim() ) {

					return done( new Error( 'you have uncommitted changes\n' + stdout.trim() ) );

				}
				done();
			} );

	},

	applyPatch: function( done ) {

	},

	formatFeatureBranch: function( done ) {

		async.series( [
			this.confirmNoUncomittedChanges.bind(this),
			// this.determineFeatureModifiedFilesAndLines.bind( this ),
			// this.runFormatter.bind( this ),
			// this.generateFilteredPatch.bind( this ),
			// this.resetChanges.bind( this ),
			// this.applyPatch.bind( this )
		], done );

	}

}

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
	} );

}

