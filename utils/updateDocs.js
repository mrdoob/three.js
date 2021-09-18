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

const GITHUB = 'https://github.com/mrdoob/three.js/blob/master';

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

					result += type;

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

		objects.push( [ match.index, match[ 1 ] || match[ 2 ] || match[ 3 ] || match[ 4 ] ] );
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
		let type = '';

		// assemble the string from multiple parts

		let result = assembleString( text, objectName );

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
				/THREE\.(\w+)(\.\w+(?:\([^)]*\))?)?(?:: ([.A-Z]\w+(?:\([^)]*\))?)(\.\w+(?:\([^)]*\))?)?)?/ );

		if ( ! match ) {

			error = '???';

		} else {

			// const groups = match.groups;
			const className = match[ 1 ];
			method = match[ 2 ] || ( ( match[ 3 ] || '' ) + ( match[ 4 ] || '' ) );

			const pos = method.indexOf( '(' );
			if ( pos >= 0 ) {

				const pos2 = method.indexOf( ')' );
				args = method.slice( pos, pos2 + 1 );
				method = method.slice( 0, pos );

			}

			type = method ? ( args ? 'method' : 'property' ) : 'class';
			result = 'The ' + type + tagFreeText( objectName, result.slice( match[ 0 ].length ) );

		}

		results.push( [ objectName, method, args, type, result ] );

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

/**
 * Add [tagging] to the free text
 */
function tagFreeText( objectName, text ) {

	// 1)
	// - Use matrixInv.copy( matrix ).invert(); instead.
	// - Set Material.shadowSide instead.
	// - Use new THREE.Float32BufferAttribute() instead.

	text = text.replace( /\s(\w+)?(\.\w+(?:\([^)]*\))?)(\.(?:\w+(?:\([^)]*\))?))?/g, ( _match, _1, _2, _3 ) => {

		let object;
		let objectArgs = '';
		let method;
		let methodArgs = '';
		let third;

		if ( _1 == 'THREE' ) {

			object = _2.slice( 1 );
			method = _3 || '';
			third = '';

		} else {

			object = _1 || '';
			method = _2 || '';
			third = _3 || '';

		}

		let pos = object.indexOf( '(' );
		if ( pos >= 0 ) {

			const pos2 = object.indexOf( ')' );
			objectArgs = object.slice( pos, pos2 + 1 );
			object = object.slice( 0, pos );

		}

		pos = method.indexOf( '(' );
		if ( pos >= 0 ) {

			const pos2 = method.indexOf( ')' );
			methodArgs = method.slice( pos, pos2 + 1 );
			method = method.slice( 0, pos );

		}

		// - Use new THREE.BufferAttribute().setUsage( THREE.DynamicDrawUsage ) instead.
		// => [page:BufferAttribute BufferAttribute()]
		//	 	.[page:BufferAttribute.setUsage .setUsage]( THREE.DynamicDrawUsage )
		//
		// - Use new THREE.CameraHelper( light.shadow.camera ) instead.

		if ( objectArgs ) {

			return ` [page:${object || objectName} ${object}]${objectArgs}`
				+ ( method ? `[page:${object || objectName}${method} ${method}]${methodArgs}${third}` : third );

		}

		return ` [page:${object || objectName}${method} ${object}${method}]${methodArgs}${third}`;

	} );

	// 2) tag simple types like Array, Integer

	text = text.replace(
		/\b(ArrayBuffer|TypedArray|Array|Boolean|Float|Integer|null|Number|Object|String|this)\b/g,
		'[param:$1 ?]'
	);

	// 3) resolve /docs/...js and /examples/...js links

	text = text.replace( /\/(docs|examples)\/[\w/]+\.js/g, match  => `[link:${GITHUB}${match} ${match}]` );

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
				<!-- THIS FILE WAS AUTO GENERATED, DO NOT EDIT -->

				<meta charset="utf-8">
				<base href="../../../">
				<script src="page.js"></script>
				<link type="text/css" rel="stylesheet" href="page.css">
			</head>
			<body>
				<h1>[name]</h1>

				<p class="desc">
				Legacy classes, properties and methods.
				</p>
	`.split( '\n' ).slice( 1, -1 ).map( item => item.slice( 2 ) ).join( '\n' );

	let lines = [ header ];

	// add data

	const results = parseLegacy( verbose );

	const hashes = new Set();
	let prevClass;

	for ( let result of results ) {

		// keep unique items

		let [ object, method, args, type, text ] = result;

		const hash = ( object + method + text ).replace( / /g, '' );
		if ( hashes.has( hash ) ) {

			continue;

		}

		hashes.add( hash );

		// add data
		// <h3>[method:String Loader.extractUrlBase]( [param:String url] )</h3>

		if ( object != prevClass ) {

			if ( type != 'class' ) {

				lines.push(
					`\n\t\t<h2>${object}</h2>\n`,
					`\t\t<p>See the [page:${object} class].</p>\n`,
				);

			} else {

				lines.push( `\n\t\t<h2 id="${object}">${object}</h2>\n` );

			}

			prevClass = object;

		}

		const data = [];

		if ( type != 'class' ) {

			const methodData = `[${type}:Any ${object}${method || ''}]${args}`;
			data.push( '<h3>' + methodData + '</h3>' );

		}

		data.push( '<p>\n' );
		data.push( ...text.replace( /\. /g, '.<br>\n' ).split( '\n' ) );
		data.push( '</p>\n' );

		lines.push( data.map( item => '\t\t' + item ).join( '\n' ) );

	}

	// footer

	const footer = `
				<h2>Source</h2>

				<p>
					[link:${GITHUB}/src/Three.Legacy.js src/Three.Legacy.js]
				</p>
			</body>
		</html>
	`.split( '\n' ).map( item => item.slice( 2 ) ).join( '\n' );

	lines.push( footer );

	fs.writeFileSync( path.join( DOCS_PATH, 'api/en/misc/Legacy.html' ), lines.join( '\n' ) );

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
