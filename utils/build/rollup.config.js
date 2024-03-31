import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

function addons() {

	return {

		transform( code, id ) {

			if ( /\/examples\/jsm\//.test( id ) === false ) return;

			code = new MagicString( code );

			code.replace( 'build/three.module.js', 'src/Three.js' );

			return {
				code: code.toString(),
				map: code.generateMap().toString()
			};

		}

	};

}

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
 * Copyright 2010-2023 Three.js Authors
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
				format: 'cjs',
				name: 'THREE',
				file: 'build/three.min.cjs',
				indent: '\t'
			}
		]
	},
	{ // @deprecated, r150
		input: 'src/Three.js',
		plugins: [
			addons(),
			glsl(),
			header(),
			// deprecationWarning()
		],
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'build/three.js',
				indent: '\t'
			}
		]
	},
	{ // @deprecated, r150
		input: 'src/Three.js',
		plugins: [
			addons(),
			glsl(),
			terser(),
			header(),
			// deprecationWarning()
		],
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'build/three.min.js'
			}
		]
	},
	{
		input: 'examples/jsm/renderers/webgpu/WebGPURenderer.js',
		output: [
			{
				format: 'es',
				name: 'WebGPURenderer',
				file: 'build/WebGPURenderer.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'src/extras/PMREMGenerator.js',
		output: [
			{
				format: 'es',
				name: 'PMREMGenerator',
				file: 'build/PMREMGenerator.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/postprocessing/EffectComposer.js',
		output: [
			{
				format: 'es',
				name: 'EffectComposer',
				file: 'build/EffectComposer.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/postprocessing/RenderPass.js',
		output: [
			{
				format: 'es',
				name: 'RenderPass',
				file: 'build/RenderPass.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/postprocessing/ShaderPass.js',
		output: [
			{
				format: 'es',
				name: 'ShaderPass',
				file: 'build/ShaderPass.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/shaders/CopyShader.js',
		output: [
			{
				format: 'es',
				name: 'CopyShader',
				file: 'build/CopyShader.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/postprocessing/Pass.js',
		output: [
			{
				format: 'es',
				name: 'Pass',
				file: 'build/Pass.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/postprocessing/OutlinePass.js',
		output: [
			{
				format: 'es',
				name: 'OutlinePass',
				file: 'build/OutlinePass.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/shaders/FXAAShader.js',
		output: [
			{
				format: 'es',
				name: 'FXAAShader',
				file: 'build/FXAAShader.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	},
	{
		input: 'examples/jsm/loaders/KTX2Loader.js',
		output: [
			{
				format: 'es',
				name: 'KTX2Loader',
				file: 'build/KTX2Loader.js',
				indent: '\t'
			}
		],
		experimentalCodeSplitting: true
	}
];

export default ( args ) => args.configOnlyModule ? builds[ 0 ] : builds;
