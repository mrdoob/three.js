/*
globals
console, process, require
*/
'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const { parseDoc } = require( '../files/search.js' );

const DOCS_PATH = path.join( process.cwd(), 'docs' );
const DOCS_PROPS_REGEX = /\[\s*(method|property):\w*\s(\w*\s*)\]/gi;
const FILES_PATH = path.join( process.cwd(), 'files' );

/**
 * Parse methods & properties from doc file
 */
function parseSource( pagePath, pageName, onlyCheck ) {

	// Read doc file
	const fileExists = fs.existsSync( pagePath );
	if ( ! fileExists ) {

		console.warn( 'File not found:', pagePath, ':', pageName);
		return null;

	}
	if ( onlyCheck ) {

		return fileExists;

	}

	const file = fs.readFileSync( pagePath, 'utf-8' );
	if ( ! file ) {

		return null;

	}

	// Parse methods & properties
	const matches = file.match( DOCS_PROPS_REGEX );
	if ( ! matches ) {

		return null;

	}

	const data = {
		method: new Set(),
		property: new Set(),
	};

	for ( const match of matches ) {

		const [ left, right ] = match.slice( 1, -1 ).split( ' ' );
		const type = ( left.split( ':' )[ 0 ] == 'method' ) ? 'method' : 'property';
		data[ type ].add( right );

	}

	for ( const type of [ 'method', 'property' ] ) {

		if ( data[ type ].size ) {

			data[ type ] = [ ...data[ type ] ].sort();

		} else {

			delete data[ type ];

		}

	}

	return ( data.method || data.property ) ? data : null;

}

/**
 * Updates docs meta in `docs/files.json`.
 */
function updateDocs( write ) {

	// Get list data
	const list = JSON.parse( fs.readFileSync( path.join( DOCS_PATH, 'list.json' ), 'utf-8' ) );

	const listEng = list.en;
	let categoryDico = {};
	let changes = 0;

    parseDoc( list, 'en', {

		skipUnderscore: false,

		categoryBefore: () => {

			categoryDico = {};
			changes = 0;

		},

        pageAfter: ( _section, _category, pageName, url, page ) => {

			if ( pageName[ 0 ] == '_' ) {

				categoryDico[ pageName ] = page;
				return;

			}

			categoryDico[ pageName ] = {};
			const pageDico = categoryDico[ pageName ];

			if ( page ) {

				pageDico.url = page;

			}

			const data = parseSource( path.join( DOCS_PATH, `${url}.html` ), pageName );
			if ( ! data ) {

				return;

			}

			changes ++;

			if ( data.method ) {

				pageDico.method = data.method;

			}

			if ( data.property ) {

				pageDico.property = data.property;

			}

        },

		categoryAfter: ( section, category ) => {

			if (changes) {

				listEng[ section ][ category ] = categoryDico;

			}

		},

    } );

	// Check other languages

	Object.keys( list ).filter( language => language != 'en' ).forEach( language => {

		parseDoc( list, language, {

			pageAfter: ( _section, _category, pageName, url ) => {

				parseSource( path.join( DOCS_PATH, `${url}.html` ), pageName, true );

			}

		} );

	} );

	// If specified, write to files.json with Mr.doob's Code Style™
	if ( write ) {

		fs.writeFileSync(
			path.join( FILES_PATH, 'docs.json' ),
			JSON.stringify( list, null, '\t' ).replace( /(\}\,)\n/g, '$1\n\n' )
		);

	}

	return list;

}

// Check whether to write via CLI flag
const args = process.argv.slice( 2 );
const write = args.includes( '--write' );

updateDocs( write );

process.exit( 0 );
