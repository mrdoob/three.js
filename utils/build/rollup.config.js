import MagicString from 'magic-string';
import path from 'path';

function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl.js$/.test( id ) === false ) return;

			code = new MagicString( code );

			code.replace( /\/\* glsl \*\/\`(.*?)\`/sg, function ( match, p1 ) {

				return JSON.stringify(
					p1
						.trim()
						.replace( /\r/g, '' )
						.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
						.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
						.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
				);

			} );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

function header() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */\n` );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

// The WebGL fallback backend of WebGPURenderer is a separate entry so it is only loaded when needed.
// Rollup would otherwise split the modules shared between entries into extra chunks, so every module
// is assigned to the chunk of the first entry that reaches it, which mirrors the default placement.
function chunks( input ) {

	let chunkByModule = null;

	return ( id, { getModuleInfo } ) => {

		if ( chunkByModule === null ) {

			chunkByModule = new Map();

			for ( const [ chunkName, entry ] of Object.entries( input ) ) {

				const stack = [ path.resolve( entry ) ];

				while ( stack.length > 0 ) {

					const moduleId = stack.pop();

					if ( chunkByModule.has( moduleId ) ) continue;

					chunkByModule.set( moduleId, chunkName );
					stack.push( ...getModuleInfo( moduleId ).importedIds );

				}

			}

		}

		return chunkByModule.get( id ) || null;

	};

}

const webgpuNodesInput = {
	'three.core.js': 'src/Three.Core.js',
	'three.webgpu.nodes.js': 'src/Three.WebGPU.Nodes.js',
	'three.webgpu.nodes.fallback.js': 'src/Three.WebGPU.Fallback.js',
};

const webgpuInput = {
	'three.core.js': 'src/Three.Core.js',
	'three.module.js': 'src/Three.js',
	'three.webgpu.js': 'src/Three.WebGPU.js',
	'three.webgpu.fallback.js': 'src/Three.WebGPU.Fallback.js',
};

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
	{
		input: webgpuNodesInput,
		plugins: [
			glsl(),
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
				manualChunks: chunks( webgpuNodesInput )
			}
		]
	},
	{
		input: webgpuInput,
		plugins: [
			glsl(),
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
				manualChunks: chunks( webgpuInput )
			}
		]
	},
	{
		input: {
			'three.tsl.js': 'src/Three.TSL.js',
		},
		plugins: [
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
			}
		],
		external: [ 'three/webgpu' ]
	}
];

export default builds;
