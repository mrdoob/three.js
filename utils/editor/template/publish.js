/**
 * Tern.js Definition Generator for three.js
 *
 * This is a JSDoc template that generates Tern.js type definitions
 * from the parsed JSDoc data. It uses JSDoc's utilities to parse
 * the source files and extract documentation.
 *
 * Usage: jsdoc -c utils/editor/jsdoc.tern.config.json
 *
 * Output: editor/js/libs/tern-threejs/threejs.js
 */

const env = require( 'jsdoc/env' );
const fs = require( 'jsdoc/fs' );
const helper = require( 'jsdoc/util/templateHelper' );
const path = require( 'jsdoc/path' );

let data;

const outdir = path.normalize( env.opts.destination );

/**
 * Check if a type name is a valid identifier for Tern.
 * @param {string} typeName - The type name to check.
 * @return {boolean} True if valid.
 */
function isValidTypeName( typeName ) {

	if ( ! typeName ) return false;

	// Must be a valid JavaScript identifier (alphanumeric and underscore, not starting with digit)
	// Also reject types with quotes, spaces, or other special characters
	return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( typeName );

}

/**
 * Convert JSDoc type to Tern type format.
 * @param {string} jsDocType - The JSDoc type string.
 * @return {string|null} The Tern type string.
 */
function convertType( jsDocType ) {

	if ( ! jsDocType ) return null;

	// Remove optional marker
	jsDocType = jsDocType.replace( /^\?/, '' );

	// Remove quotes if present
	jsDocType = jsDocType.replace( /^['"]|['"]$/g, '' );

	// Handle unions - use the first type for Tern (Tern doesn't handle unions well)
	if ( jsDocType.includes( '|' ) ) {

		const types = jsDocType.split( '|' ).map( t => t.trim() );
		return convertType( types[ 0 ] );

	}

	// Handle arrays
	const arrayMatch = jsDocType.match( /^Array(?:<(.+)>)?$/ );
	if ( arrayMatch ) {

		if ( arrayMatch[ 1 ] ) {

			const innerType = convertType( arrayMatch[ 1 ] );
			if ( innerType ) {

				return `[${innerType}]`;

			}

		}

		return '[]';

	}

	// Handle primitive types
	const primitiveMap = {
		'number': 'number',
		'Number': 'number',
		'string': 'string',
		'String': 'string',
		'boolean': 'bool',
		'Boolean': 'bool',
		'bool': 'bool',
		'object': 'object',
		'Object': 'object',
		'function': 'fn()',
		'Function': 'fn()',
		'void': 'undefined',
		'undefined': 'undefined',
		'null': 'null',
		'any': '?',
		'*': '?'
	};

	if ( primitiveMap[ jsDocType ] ) {

		return primitiveMap[ jsDocType ];

	}

	// Validate the type name is a valid identifier
	if ( ! isValidTypeName( jsDocType ) ) {

		return null;

	}

	// Handle TypedArrays
	if ( jsDocType.endsWith( 'Array' ) && jsDocType !== 'Array' ) {

		return '+' + jsDocType;

	}

	// Handle class references - prepend THREE. for three.js classes
	return '+THREE.' + jsDocType;

}


/**
 * Build a Tern function type string from params and returns.
 * @param {Array} params - Array of parameter objects.
 * @param {Array} returns - Array of return objects.
 * @return {string} The Tern function type string.
 */
function buildFunctionType( params, returns ) {

	const paramStrings = [];

	if ( params ) {

		for ( const p of params ) {

			// Skip nested params (e.g., options.foo)
			if ( p.name && p.name.includes( '.' ) ) continue;

			const type = p.type && p.type.names ? convertType( p.type.names[ 0 ] ) : null;

			if ( type ) {

				paramStrings.push( `${p.name}: ${type}` );

			} else if ( p.name ) {

				paramStrings.push( p.name );

			}

		}

	}

	let fnType = `fn(${paramStrings.join( ', ' )})`;

	if ( returns && returns.length > 0 && returns[ 0 ].type && returns[ 0 ].type.names ) {

		const returnType = convertType( returns[ 0 ].type.names[ 0 ] );

		if ( returnType && returnType !== 'undefined' ) {

			fnType += ` -> ${returnType}`;

		}

	}

	return fnType;

}

/**
 * Clean description text for JSON output.
 * @param {string} text - The description text.
 * @return {string} The cleaned text.
 */
function cleanDescription( text ) {

	if ( ! text ) return '';

	return text
		.replace( /\{@link\s+(\w+)(?:#(\w+))?\s*\}/g, '$1' )
		.replace( /\{@link\s+(\w+)(?:#(\w+))?\s*\|([^}]+)\}/g, '$3' )
		.replace( /`([^`]+)`/g, '$1' )
		.replace( /<[^>]+>/g, '' ) // Remove HTML tags
		.replace( /\s+/g, ' ' )
		.trim();

}

/**
 * Get documentation URL category for a class.
 * @param {string} className - The class name.
 * @param {string} filePath - The file path.
 * @return {string} The category path.
 */
function getCategory( className, filePath ) {

	if ( ! filePath ) return 'core';

	// Extract category from file path
	const match = filePath.match( /src\/(\w+)/ );
	if ( match ) {

		return match[ 1 ];

	}

	return 'core';

}

/**
 * Find doclets matching a specification.
 * @param {Object} spec - The search specification.
 * @return {Array} Matching doclets.
 */
function find( spec ) {

	return helper.find( data, spec );

}

/**
 * Main publish function called by JSDoc.
 * @param {TAFFY} taffyData - The doclet database.
 * @param {Object} opts - The options object.
 */
exports.publish = ( taffyData/*, opts */ ) => {

	data = taffyData;

	// Prune data to remove undocumented items
	data = helper.prune( data );
	data.sort( 'longname, version, since' );

	// Build the Tern definitions
	const defs = {
		'!name': 'threejs',
		'THREE': {}
	};

	// Get all classes
	const classes = find( { kind: 'class' } );
	const classMap = {};

	// First pass: collect all classes
	for ( const cls of classes ) {

		if ( cls.access === 'private' ) continue;
		if ( ! cls.meta || ! cls.meta.path ) continue;

		// Only include classes from src directory
		if ( ! cls.meta.path.includes( '/src/' ) ) continue;

		classMap[ cls.longname ] = {
			doclet: cls,
			properties: {},
			methods: {}
		};

	}

	// Second pass: collect members for each class
	const members = find( { kind: 'member' } );

	for ( const member of members ) {

		if ( member.access === 'private' ) continue;
		if ( ! member.memberof ) continue;

		const parentClass = classMap[ member.memberof ];
		if ( ! parentClass ) continue;

		// Skip .is* type-checking properties (like isCamera, isMesh)
		if ( member.name && member.name.startsWith( 'is' ) && member.name.length > 2 ) {

			const thirdChar = member.name[ 2 ];
			if ( thirdChar === thirdChar.toUpperCase() ) continue;

		}

		parentClass.properties[ member.name ] = {
			type: member.type && member.type.names ? member.type.names[ 0 ] : null,
			description: member.description || ''
		};

	}

	// Third pass: collect methods for each class
	const methods = find( { kind: 'function' } );

	for ( const method of methods ) {

		if ( method.access === 'private' ) continue;
		if ( ! method.memberof ) continue;

		const parentClass = classMap[ method.memberof ];
		if ( ! parentClass ) continue;

		parentClass.methods[ method.name ] = {
			params: method.params,
			returns: method.returns,
			description: method.description || ''
		};

	}

	// Build the Tern output
	const sortedClassNames = Object.keys( classMap ).sort();

	for ( const className of sortedClassNames ) {

		const classInfo = classMap[ className ];
		const cls = classInfo.doclet;

		const category = getCategory( className, cls.meta ? cls.meta.path : null );

		const classDef = {
			'!url': `https://threejs.org/docs/#api/en/${category}/${cls.name}`,
			'prototype': {}
		};

		// Add class documentation
		if ( cls.description ) {

			classDef[ '!doc' ] = cleanDescription( cls.description );

		}

		// Add constructor type
		if ( cls.params && cls.params.length > 0 ) {

			classDef[ '!type' ] = buildFunctionType( cls.params, null );

		} else {

			classDef[ '!type' ] = 'fn()';

		}

		// Add parent class reference
		if ( cls.augments && cls.augments.length > 0 ) {

			classDef[ 'prototype' ][ '!proto' ] = `THREE.${cls.augments[ 0 ]}.prototype`;

		}

		// Add properties
		for ( const [ propName, propInfo ] of Object.entries( classInfo.properties ) ) {

			const propDef = {};

			if ( propInfo.type ) {

				const ternType = convertType( propInfo.type );

				if ( ternType ) {

					propDef[ '!type' ] = ternType;

				}

			}

			if ( propInfo.description ) {

				propDef[ '!doc' ] = cleanDescription( propInfo.description );

			}

			if ( Object.keys( propDef ).length > 0 ) {

				classDef[ 'prototype' ][ propName ] = propDef;

			}

		}


		// Add methods
		for ( const [ methodName, methodInfo ] of Object.entries( classInfo.methods ) ) {

			const methodDef = {
				'!type': buildFunctionType( methodInfo.params, methodInfo.returns )
			};

			if ( methodInfo.description ) {

				methodDef[ '!doc' ] = cleanDescription( methodInfo.description );

			}

			classDef[ 'prototype' ][ methodName ] = methodDef;

		}

		defs[ 'THREE' ][ cls.name ] = classDef;

	}

	// Generate the output file content
	const defsJson = JSON.stringify( defs, null, 2 );

	const output = `(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return mod(require("tern/lib/infer"), require("tern/lib/tern"));
  if (typeof define == "function" && define.amd) // AMD
    return define([ "tern/lib/infer", "tern/lib/tern" ], mod);
  mod(tern, tern);
})(function(infer, tern) {
  "use strict";

  tern.registerPlugin("threejs", function(server, options) {
    return {
      defs : ${defsJson}
    };
  });
});
`;

	// Write output file
	fs.mkPath( outdir );

	const outputFile = path.join( outdir, 'threejs.js' );
	fs.writeFileSync( outputFile, output, 'utf8' );

	console.log( `Tern definitions written to: ${outputFile}` );
	console.log( `Generated definitions for ${sortedClassNames.length} classes` );

};
