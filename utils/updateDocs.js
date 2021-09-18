// updateDocs.js
//
// 1) Generate files/docs.json
//		- use structure from: docs/list.json
//		- get methods and properties from the html files
//
// 2) Generate files/legacy.json + legacy.html (optional)
//		- parse Three.Legacy.js

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
const SRC_PATH = path.join( CWD, 'src' );

// LEGACY
/////////

/**
 * Assemble a string from multiple '...' parts
 */
function assembleString( text, type ) {

	let result = '';
	let segment = '';
	let opened;

	for ( let i = 0, length = text.length; i < length; i ++ ) {

		let char = text[ i ];

		if ( char == '\\' ) {

			i ++;

			if ( text[ i ] == '\\' ) {

				result += '\\';

			}

		} else if ( char == "'" ) {

			if ( opened ) {

				result += segment;
				segment = '';
				opened = 0;

			} else {

				// 'THREE.' + this.type + ': .shading has been removed.
				// => THREE.*Material: .shading

				if ( segment.includes( 'this.type' ) ) {

					result += '*' + type;

				}

				segment = '';
				opened = 1;

			}

		} else {

			segment += char;

		}

	}

	return result.replace( /\s{2,}/g, ' ' ).trim();

}

/**
 * Parse Three.Legacy.js
 * - console.error( 'THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.' );
 * - console.warn( 'THREE.Float64Attribute has been removed. Use new THREE.Float64BufferAttribute() instead.' );
 * - console.log( 'THREE.Curve.create() has been deprecated' );
 */
function parseLegacy() {

	const pagePath = path.join( SRC_PATH, 'Three.Legacy.js' );
	const data = fs.readFileSync( pagePath, 'utf-8' );

	// get object identifiers
	// - export function PointCloud( geometry, material ) {
	// - Object.defineProperties( Material.prototype, {
	// - Matrix4.prototype.applyToBufferAttribute = function ( attribute )
	// - ImageUtils.loadCompressedTextureCube = function () {
	// - export const SceneUtils = {

	let objCount = 0;
	const objects = [];

	for ( let match of data.matchAll(
			/export function (\w+)|(\w+)\.prototype\b|\n(\w+)\.\w+ = function|export const (\w+)/g ) ) {

		objects.push( [ match.index, match[ 1 ] || match[ 2 ] || match[ 3 ] || match[4] ] );
		objCount ++;

	}

	// parse console messages

	let consoleCount = 0;
	let objIndex = 0;
	const results = [];

	for ( let message of data.matchAll( /console\.(?:\w+)\(\s*((:?.|\r|\n)*?)\);[\r\n]/g ) ) {

		// align object with console message

		const index = message.index;
		const text = message[ 1 ];

		while ( objIndex < objCount - 1 && objects[ objIndex + 1 ][ 0 ] < index ) {

			objIndex ++;

		}

		const object = objects[ objIndex ] || [];
		let objectName = object[ 1 ];
		let error = '';
		let method = '';
		let args = '';

		// assemble the string from multiple parts

		const result = assembleString(text, objectName);

		// guess main object + main method/property
		// - THREE.Curve.create() has been deprecated
		// - THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.
		// - THREE.Float32Attribute has been removed. Use new THREE.Float32BufferAttribute() instead.
		// - THREE.Path: .fromPoints() has been renamed to .setFromPoints().
		// - THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead.
		// - THREE.Matrix3: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead.
		// - THREE.PerspectiveCamera.setLens is deprecated.
		// - THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.

		const match = result.match(
				/THREE\.(?<class>\w+)(?<method>\.\w+(?:\(.*?\))?)?(?:: (?<method2>\.\w+(?:\(.*?\))?))?/ );

		if ( ! match ) {

			error = '???';

		} else {

			const groups = match.groups;
			const className = groups.class;
			method = groups.method || groups.method2 || '';

			if ( className != objectName ) {

				error = className;
				objectName = className;

			}

			const pos = method.indexOf( '(' );
			if ( pos >= 0 ) {

				args = '()';
				method = method.slice( 0, pos );

			}

		}

		results.push( [ objectName, method, args, result ] );

		if ( verbose || error ) {

			console.log( consoleCount, index, error, objectName, method, result, result ? '' : text );

		}

		consoleCount ++;

	}

	return results.sort( ( a, b ) => {

		if ( a[ 0 ] != b[ 0 ] ) {

			return a[ 0 ].localeCompare( b[ 0 ] );

		}

		return a[ 1 ].localeCompare( b[ 1 ] );

	} );

}

function tagText( text ) {

	return text;

}

/**
 * Create a Legacy.html file
 */
function updateLegacy( verbose ) {

	// header

	const header = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<base href="../../../">
				<script src="page.js"></script>
				<link type="text/css" rel="stylesheet" href="page.css">
			</head>
			<body>
				<h1>[name]</h1>

				<p class="desc">
				Legacy methods.
				</p>
	`.split( '\n' ).slice( 1, -1 ).map( item => item.slice( 2 ) ).join( '\n' );

	let lines = [ header ];

	// add data

	const results = parseLegacy( verbose );

	const hashes = new Set();
	let count = 0;
	let prevClass;

	for ( let result of results ) {

		// keep unique items

		let [ object, method, args, text ] = result;

		const hash = ( object + method + text ).replace( / /g, '' );

		if ( hashes.has( hash ) ) {

			continue;

		}

		hashes.add( hash );

		// add data
		// <h3>[method:String Loader.extractUrlBase]( [param:String url] )</h3>

		const type = args ? 'method' : 'property';
		const methodData = `[${type}:Any ${object}${method || ''}]${args}`;

		if ( object != prevClass ) {

			lines.push( `\n\t\t<h2>${object}</h2>\n` );
			prevClass = object;

		}

		const data = [
			'<h3>' + methodData + '</h3>',
			'<p>',
		];

		data.push( ...text.replace( /\. /g, '.<br>\n' ).split( '\n' ) );
		data.push( '</p>\n' );

		lines.push( data.map( item => '\t\t' + item ).join( '\n' ) );

		// console.log( count, result );
		count ++;

	}

	// footer

	const footer = `
				<h2>Source</h2>

				<p>
					[link:https://github.com/mrdoob/three.js/blob/master/src/Three.Legacy.js src/Three.Legacy.js]
				</p>
			</body>
		</html>
	`.split( '\n' ).map( item => item.slice( 2 ) ).join( '\n' );

	lines.push(footer);

	fs.writeFileSync( path.join( DOCS_PATH, 'api/en/extras/Legacy.html' ), lines.join( '\n' ) );

}

// DOCS
///////

/**
 * Parse methods & properties from doc file
 */
function parseSource( pagePath, pageName, onlyCheck ) {

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

	for ( let prop of data.matchAll( /\[\s*(method|property):\w*\s([\w.]*\s*)\]/gi ) ) {

		dico[ prop[ 1 ] ].push( prop[ 2 ] );

	}

	for ( const type of [ 'method', 'property' ] ) {

		if ( ! dico[ type ].length ) {

			delete dico[ type ];

		}

	}

	return ( dico.method || dico.property ) ? dico : null;

}

/**
 * Updates docs meta in `docs/files.json`.
 */
function updateDocs() {

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
const verbose = args.has( '--verbose' );

if ( args.has( '--legacy' ) ) {

	updateLegacy( verbose );

}

if ( args.has( '--docs' ) ) {

	updateDocs();

}

process.exit( 0 );
