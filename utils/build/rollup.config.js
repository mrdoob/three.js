import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

export function glsl() {

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
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */\n` );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
	{
		input: {
			'three.core.js': 'src/Three.Core.js',
			'three.webgpu.nodes.js': 'src/Three.WebGPU.Nodes.js',
		},
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
			}
		]
	},
	{
		input: {
			'three.core.js': 'src/Three.Core.js',
			'three.module.js': 'src/Three.js',
			'three.webgpu.js': 'src/Three.WebGPU.js',
		},
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
	},
	{
		input: {
			'three.core.min.js': 'src/Three.Core.js',
			'three.webgpu.nodes.min.js': 'src/Three.WebGPU.Nodes.js',
		},
		plugins: [
			glsl(),
			header(),
			terser()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
			}
		]
	},
	{
		input: {
			'three.core.min.js': 'src/Three.Core.js',
			'three.module.min.js': 'src/Three.js',
			'three.webgpu.min.js': 'src/Three.WebGPU.js',
		},
		plugins: [
			glsl(),
			header(),
			terser()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
			}
		]
	},
	{
		input: {
			'three.tsl.min.js': 'src/Three.TSL.js'
		},
		plugins: [
			header(),
			terser()
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
	},
	{
		input: 'src/Three.js',
		plugins: [
			glsl(),
			header()
		],
		output: [
			{
				format: 'cjs',
				name: 'THREE',
				file: 'build/three.cjs',
				indent: '\t'
			}
		]
	}
];

export default ( args ) => args.configOnlyModule ? builds.slice( 0, 4 ) : builds;
