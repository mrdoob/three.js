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

const builds = [
	{
		input: 'src/Three.js',
		plugins: [
			glsl(),
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.module.js'
			}
		]
	},
	{
		input: 'src/Three.WebGPU.js',
		plugins: [
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.webgpu.js'
			}
		]
	},
	{
		input: 'src/Three.WebGPU.Nodes.js',
		plugins: [
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.webgpu.nodes.js'
			}
		]
	},
	{
		input: 'src/Three.js',
		plugins: [
			glsl(),
			header(),
			terser()
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.module.min.js'
			}
		]
	},
	{
		input: 'src/Three.WebGPU.js',
		plugins: [
			header(),
			terser()
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.webgpu.min.js'
			}
		]
	},
	{
		input: 'src/Three.WebGPU.Nodes.js',
		plugins: [
			header(),
			terser()
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.webgpu.nodes.min.js'
			}
		]
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

export default ( args ) => args.configOnlyModule ? builds.slice( 0, 3 ) : builds;
