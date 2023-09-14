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

			code = new MagicString( code );

			code.replace( /\/\* glsl \*\/\`(.*?)\`/sg, function ( match, p1 ) {

				return JSON.stringify(
					p1
						.replace(/\/\*(.*?)\*\//gs, m => /\n/.test(m) ? '\n' : '') // replace multiline block comment
						.replace(/\/\/.*$/gm, '\n') // replace line comment with '\n'
						.replace(/\s*\n\s*/g, '\n') // remove wsp around '\n'
						.replace(/[ \r\t]+/g, ' ') // reduce wsp (non LF) in a row
						.replace(/^\s+/gm, '') // remove leading wsp
						.replace(/0\.(\d)/g, '.$1') // number: remove zero before '.'; '0.1' -> '.1'
						.replace(/(\d+)\.0+(\D|$)/gm, '$1.$2') // number: remove zeros after '.'; '1.0000' -> '1.'
						.replace(/(?<!^#.*)(?:[ \r\t])*([=+*/?:!|&<>{}()[\];.,-])\s*(?!#)/gm, '$1') // nonmacro: remove wsp around seps
						.replace(/^#[^\n]*/gm, (m) => // macro
							m.replace(/\s*([=+*/?:!|&<>{}[\];.,-])\s/g, '$1') // remove wsp around seps, except braces
							.replace(/\([ \r\t]*(.*?)/g, '($1') // remove wsp after '('
							.replace(/(.*?)[ \r\t]*\)/g, '$1)') // remove wsp before ')'
							.replace(/\)[ \r\t]*([&|])/g, ')$1') // remove wsp after ')' if next nonwsp ch is '&' or '|'
						)
				);

			} );

			return {
				code: code.toString(),
				map: code.generateMap().toString()
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
				map: code.generateMap().toString()
			};

		}

	};

}

function deprecationWarning() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `console.warn( 'Scripts "build/three.js" and "build/three.min.js" are deprecated with r150+, and will be removed with r160. Please use ES Modules or alternatives: https://threejs.org/docs/index.html#manual/en/introduction/Installation' );\n` );

			return {
				code: code.toString(),
				map: code.generateMap().toString()
			};

		}

	};

}

const builds = [
	{
		input: 'src/Three.js',
		plugins: [
			addons(),
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
			addons(),
			glsl(),
			terser(),
			header()
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
			addons(),
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

	{ // @deprecated, r150
		input: 'src/Three.js',
		plugins: [
			addons(),
			glsl(),
			header(),
			deprecationWarning()
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
			deprecationWarning()
		],
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'build/three.min.js'
			}
		]
	}
];

export default ( args ) => args.configOnlyModule ? builds[ 0 ] : builds;
