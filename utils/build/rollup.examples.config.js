import babel from '@rollup/plugin-babel';
import path from 'path';
import os from 'os';
import glob from 'glob';
import babelrc from './.babelrc.json';

const EOL = os.EOL;

function babelCleanup() {

	return {

		transform( code ) {

			// remove comments messed up by babel that break eslint
			// example:
			// 	  setSize: function ()
			//    /* width, height */
			//    {
			//             ↓
			// 	  setSize: function () {
			code = code.replace( new RegExp( `\\(\\)${EOL}\\s*\\/\\*([a-zA-Z0-9_, ]+)\\*\\/${EOL}\\s*{`, 'g' ), '( ) {' );

			return {
				code: code,
				map: null
			};

		}

	};

}





function unmodularize() {

	return {


		renderChunk( code, { fileName } ) {

			// Namespace the modules that end with Utils
			const fileNameNoExtension = fileName.slice( 0, fileName.indexOf( '.' ) );
			const namespace = fileNameNoExtension.endsWith( 'Utils' ) ? fileNameNoExtension : undefined;

			// export { Example };
			// ↓
			// THREE.Example = Example;
			code = code.replace( /export { ([a-zA-Z0-9_, ]+) };/g, ( match, p1 ) => {

				const exps = p1.split( ', ' );

				let output = '';

				if ( namespace ) {

					output += `THREE.${namespace} = {};${ EOL }`;
					output += exps.map( exp => `THREE.${namespace}.${exp} = ${exp};` ).join( EOL );

				} else {

					output += exps.map( exp => `THREE.${exp} = ${exp};` ).join( EOL );

				}


				return output;

			} );

			// import { Example } from '...';
			// but excluding imports importing from the libs/ folder
			const imports = [];
			code = code.replace( /import { ([a-zA-Z0-9_, ]+) } from '((?!libs).)*';/g, ( match, p1 ) => {

				const imps = p1.split( ', ' );
				imps.reverse();
				imports.push( ...imps );

				return '';

			} );

			// import * as Example from '...';
			// but excluding imports importing from the libs/ folder
			code = code.replace( /import \* as ([a-zA-Z0-9_, ]+) from '((?!libs).)*';/g, ( match, p1 ) => {

				const imp = p1;
				if ( imp !== 'THREE' ) {

					imports.push( imp );

				}

				return '';

			} );


			// new Example()
			// (Example)
			// [Example]
			// Example2
			// ↓
			// new THREE.Example()
			// (THREE.Example)
			// [THREE.Example]
			// Example2
			function prefixThree( word ) {

				code = code.replace( new RegExp( `([\\s([!])${word}([^a-zA-Z0-9_])`, 'g' ), ( match, p1, p2 ) => {

					return `${p1}THREE.${word}${p2}`;

				} );

			}

			imports.forEach( prefixThree );


			// Do it again for this particular example
			// new Example(Example)
			// ↓
			// new THREE.Example(THREE.Example)
			imports.forEach( prefixThree );

			// fix for BasisTextureLoader.js
			imports.forEach( imp => {

				code = code.replace( new RegExp( `${EOL}(\\s)*THREE\\.${imp}:`, 'g' ), ( match, p1 ) => {

					return `${EOL}${p1}${imp}:`;

				} );

			} );

			// import * as THREE from '...';
			code = code.replace( /import \* as THREE from '(.*)';/g, '' );

			// Remove library imports that are exposed as
			// global variables in the non-module world
			code = code.replace( /import (.*) from '(.*)\/libs\/(.*)';/g, '' );

			// remove newline at the start of file
			code = code.trimStart();

			code = `( function () {${EOL}${code}${EOL}} )();`;

			return {
				code: code,
				map: null
			};

		}

	};

}


const jsFolder = path.resolve( __dirname, '../../examples/js' );
const jsmFolder = path.resolve( __dirname, '../../examples/jsm' );

// list of all .js file nested in the examples/jsm folder
const files = glob.sync( '**/*.js', { cwd: jsmFolder, ignore: [
	// don't convert libs
	'capabilities/*',
	'libs/**/*',
	'loaders/ifc/**/*',

	// no non-module library
	// https://unpkg.com/browse/@webxr-input-profiles/motion-controllers@1.0.0/dist/
	'webxr/**/*',

	// no non-module library
	// https://unpkg.com/browse/web-ifc@0.0.17/
	'loaders/IFCLoader.js',
	'loaders/USDZLoader.js',
	'node-editor/**/*',

	'renderers/webgl/**/*',
	'renderers/webgpu/**/*',
	'renderers/nodes/**/*',
	'nodes/**/*',
	'loaders/NodeMaterialLoader.js',
	'offscreen/**/*',

	// dont convert new files
	'exporters/KTX2Exporter.js',
	'loaders/KTX2Loader.js',
	'loaders/MaterialXLoader.js'

] } );


// Create a rollup config for each .js file
export default files.map( file => {

	const inputPath = path.join( 'examples/jsm', file );
	const outputPath = path.resolve( jsFolder, file );


	return {

		input: inputPath,
		treeshake: false,
		external: () => true, // don't bundle anything
		plugins: [
			babel( {
				babelHelpers: 'bundled',
				babelrc: false,
				...babelrc
			} ),
			babelCleanup(),
			unmodularize(),
		],

		output: {

			format: 'esm',
			file: outputPath,

		}

	};

} );
