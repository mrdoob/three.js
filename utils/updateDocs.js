// updateDocs.js
//
// node updateDocs.js --docs
//
// 1) Generate files/docs.json
//		- use structure from: docs/list.json
//		- get properties/methods from the html files
//      - this file will allow the docs page to search for properties/methods in addition to classes

/*
globals
console, process, require
*/
'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const { parseDoc } = require( '../files/search.js' );

const CWD = process.cwd();
const DOCS_PATH = path.join( CWD, 'docs' );
const FILES_PATH = path.join( CWD, 'files' );

// DOCS
///////

/**
 * Parse methods & properties from doc file
 */
function parseSource( pagePath, pageName, onlyCheck, addTitle ) {

	// Read doc file
	const fileExists = fs.existsSync( pagePath );
	if ( ! fileExists ) {

		console.warn( 'File not found:', pagePath, ':', pageName );
		return null;

	}
	if ( onlyCheck ) {

		return fileExists;

	}

	const data = fs.readFileSync( pagePath, 'utf-8' );
	if ( ! data ) {

		return null;

	}

	// Parse methods & properties

	const dico = {
		method: [],
		property: [],
	};

	for ( let prop of data.matchAll( /\[\s*(method|property):\w*\s([\w.]*\s*)\]|<h2 id="(\w+)"/gi ) ) {

		if ( prop[ 3 ] ) {

			dico.property.push( prop[ 3 ] );

		} else {

			dico[ prop[ 1 ] ].push( prop[ 2 ] );

		}

	}

	for ( const type of [ 'method', 'property' ] ) {

		if ( ! dico[ type ].length ) {

			delete dico[ type ];

		}

	}

	// add the title?

	if ( addTitle ) {

	}

	return ( dico.method || dico.property ) ? dico : null;

}

/**
 * Create files/docs.json by analysing docs/list.json and the corresponding HTML pages
 */
function updateDocs( addTitle ) {

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

        pageAfter: ( _section, _category, pageName, url, page, args ) => {

			if ( pageName[ 0 ] == '_' ) {

				categoryDico[ pageName ] = args || page;
				return;

			}

			categoryDico[ pageName ] = {};
			const pageDico = categoryDico[ pageName ];

			if ( args ) {

				pageDico.url = args;

			} else if ( page && page != 1 ) {

				pageDico.url = page;

			}

			const data = parseSource( path.join( DOCS_PATH, `${url}.html` ), pageName, false, addTitle );
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

			if ( changes ) {

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

	// save file

	fs.writeFileSync(
		path.join( FILES_PATH, 'docs.json' ),
		JSON.stringify( list, null, '\t' ).replace( /(\}\,)\n/g, '$1\n\n' )
	);

	return list;

}

// Check whether to write via CLI flag
const args = new Set( process.argv.slice( 2 ) );
const docs = args.has( '--docs' );
const title = args.has( '--title' );

if ( docs ) {

	updateDocs( title );

}

process.exit( 0 );
