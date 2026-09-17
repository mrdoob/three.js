/**
 * Generates examples/jsm/loaders/materialx/MaterialXNodeInterfaceRegistry.js
 * from the nodedefs of a MaterialX libraries checkout.
 *
 * Usage:
 *   node utils/materialx/generateNodeInterfaceRegistry.js <path-to-MaterialX>/libraries
 *
 * The registry records, for every stdlib nodedef, the node category, the declared
 * inputs with their types and default values, and the declared outputs. The loader
 * uses it to resolve the nodedef of a node instance and to supply nodedef defaults
 * for inputs the document does not author.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const librariesPath = process.argv[ 2 ];

if ( ! librariesPath ) {

	console.error( 'Usage: node utils/materialx/generateNodeInterfaceRegistry.js <path-to-MaterialX>/libraries' );
	process.exit( 1 );

}

const outputPath = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '../../examples/jsm/loaders/materialx/MaterialXNodeInterfaceRegistry.js' );

// Only these input attributes affect translation. UI hints are dropped to keep the registry small.
const INPUT_ATTRIBUTES = [ 'type', 'value', 'defaultgeomprop' ];

// Nodedefs whose output is a closure or light type are left out: the loader translates
// surface and displacement shaders to materials directly and cannot compile BSDF, EDF or
// VDF graphs, so their interfaces would only add weight to the registry.
const EXCLUDED_OUTPUT_TYPES = new Set( [ 'BSDF', 'EDF', 'VDF', 'lightshader', 'volumeshader' ] );

function readVersion( librariesRoot ) {

	const cmake = path.join( librariesRoot, '..', 'CMakeLists.txt' );
	if ( ! fs.existsSync( cmake ) ) return 'unknown';

	const text = fs.readFileSync( cmake, 'utf8' );
	const part = ( name ) => ( text.match( new RegExp( `MATERIALX_${name}_VERSION\\s+(\\d+)` ) ) || [] )[ 1 ];
	return `${part( 'MAJOR' )}.${part( 'MINOR' )}.${part( 'BUILD' )}`;

}

function* walk( directory ) {

	for ( const entry of fs.readdirSync( directory, { withFileTypes: true } ) ) {

		const entryPath = path.join( directory, entry.name );
		if ( entry.isDirectory() ) {

			// gen* directories hold per-target implementations, not nodedefs.
			if ( ! entry.name.startsWith( 'gen' ) ) yield* walk( entryPath );

		} else if ( entry.name.endsWith( '.mtlx' ) ) yield entryPath;

	}

}

// Minimal XML tag scanner. Nodedef files only use elements and attributes, so a full
// parser is unnecessary and Node has no built-in DOMParser.
function* tags( xml ) {

	let withoutComments = xml;
	let previous;
	do {

		previous = withoutComments;
		withoutComments = withoutComments.replace( /<!--[\s\S]*?-->/g, '' );

	} while ( withoutComments !== previous );

	const tagPattern = /<(\/?)([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
	const attributePattern = /([\w:.-]+)\s*=\s*"([^"]*)"/g;

	for ( const match of withoutComments.matchAll( tagPattern ) ) {

		const [ , closing, name, attributeText, selfClosing ] = match;
		const attributes = {};
		for ( const attribute of attributeText.matchAll( attributePattern ) ) attributes[ attribute[ 1 ] ] = attribute[ 2 ];
		yield { name, attributes, closing: closing === '/', selfClosing: selfClosing === '/' };

	}

}

function parseNodeDefs( xml, nodedefs ) {

	let current = null;

	for ( const tag of tags( xml ) ) {

		if ( tag.name === 'nodedef' ) {

			if ( tag.closing ) {

				current = null;
				continue;

			}

			const { name, node, inherit, type } = tag.attributes;
			current = { node, inherit: inherit || null, inputs: {}, outputs: {} };
			if ( type && type !== 'multioutput' ) current.outputs.out = type;
			nodedefs[ name ] = current;
			if ( tag.selfClosing ) current = null;

		} else if ( current && ! tag.closing && tag.name === 'input' ) {

			const input = {};
			for ( const attribute of INPUT_ATTRIBUTES ) {

				if ( tag.attributes[ attribute ] !== undefined ) input[ attribute ] = tag.attributes[ attribute ];

			}

			current.inputs[ tag.attributes.name ] = input;

		} else if ( current && ! tag.closing && tag.name === 'output' ) {

			current.outputs[ tag.attributes.name ] = tag.attributes.type;

		}

	}

}

function resolveInheritance( nodedefs ) {

	const resolved = {};

	const resolve = ( name, seen = new Set() ) => {

		if ( resolved[ name ] ) return resolved[ name ];

		const nodedef = nodedefs[ name ];
		if ( ! nodedef ) throw new Error( `Unknown nodedef "${name}" referenced by inherit.` );
		if ( seen.has( name ) ) throw new Error( `Cyclic inherit at nodedef "${name}".` );
		seen.add( name );

		const base = nodedef.inherit ? resolve( nodedef.inherit, seen ) : { inputs: {}, outputs: {} };
		resolved[ name ] = {
			node: nodedef.node,
			inputs: { ...base.inputs, ...nodedef.inputs },
			outputs: { ...base.outputs, ...nodedef.outputs },
		};
		return resolved[ name ];

	};

	for ( const name of Object.keys( nodedefs ) ) resolve( name );
	return resolved;

}

const nodedefs = {};

for ( const file of walk( librariesPath ) ) {

	parseNodeDefs( fs.readFileSync( file, 'utf8' ), nodedefs );

}

const resolved = resolveInheritance( nodedefs );

for ( const [ name, nodedef ] of Object.entries( resolved ) ) {

	if ( Object.values( nodedef.outputs ).some( ( type ) => EXCLUDED_OUTPUT_TYPES.has( type ) ) ) delete resolved[ name ];

}

const lines = [
	'/* eslint-disable */',
	`// Generated by utils/materialx/generateNodeInterfaceRegistry.js from MaterialX ${readVersion( librariesPath )}. Do not edit.`,
	'const registryData = {',
	`\t"version": ${JSON.stringify( readVersion( librariesPath ) )},`,
	'\t"nodedefs": {',
	...Object.keys( resolved ).sort().map( ( name ) => `\t\t${JSON.stringify( name )}: ${JSON.stringify( resolved[ name ] )},` ),
	'\t},',
	'};',
	'',
	'export default registryData;',
	'',
];

fs.writeFileSync( outputPath, lines.join( '\n' ) );
console.log( `Wrote ${Object.keys( resolved ).length} nodedefs to ${path.relative( process.cwd(), outputPath )}` );
