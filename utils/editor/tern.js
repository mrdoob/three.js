/**
 * Tern.js Definition Generator for three.js
 *
 * This script runs JSDoc with a custom template to generate Tern.js
 * type definitions from the JSDoc comments in the source files.
 *
 * Usage: node utils/editor/tern.js
 *
 * Output: editor/js/libs/tern-threejs/threejs.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );
const ROOT_DIR = path.resolve( __dirname, '../../' );

console.log( 'Generating Tern.js definitions for three.js...' );
console.log( 'Running JSDoc with Tern template...' );

const jsdoc = spawn( 'npx', [
	'jsdoc',
	'-c', 'utils/editor/jsdoc.tern.config.json'
], {
	cwd: ROOT_DIR,
	stdio: 'inherit',
	shell: true
} );

jsdoc.on( 'close', ( code ) => {

	if ( code === 0 ) {

		console.log( 'Done! Tern definitions generated successfully.' );

	} else {

		console.error( `JSDoc exited with code ${code}` );
		process.exit( code );

	}

} );
