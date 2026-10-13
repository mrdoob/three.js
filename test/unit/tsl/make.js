import { readFile, writeFile } from 'node:fs/promises';
import { cases } from './cases.js';
import { builders, generateCode } from './code.js';
import { parseReferences, formatReferences } from './references.js';

const names = process.argv.slice( 2 );
const selected = names.length > 0 ? names : Object.keys( cases );

for ( const name of selected ) {

	if ( ! Object.hasOwn( cases, name ) ) throw new Error( `Unknown TSL case: ${ name }. Available cases: ${ Object.keys( cases ).join( ', ' ) }` );

}

// Generate everything before writing, so a build error cannot update only some references.
const references = [];

for ( const language of Object.keys( builders ) ) {

	const file = new URL( `./reference.${ language }`, import.meta.url );
	let sections = new Map();

	if ( names.length > 0 ) {

		try {

			sections = parseReferences( await readFile( file, 'utf8' ) );

		} catch ( error ) {

			if ( error.code !== 'ENOENT' ) throw error;

		}

	}

	for ( const name of selected ) {

		sections.set( name, generateCode( cases[ name ], language ) );

	}

	// Keep case order stable, including when updating only selected sections.
	const ordered = new Map( Object.keys( cases ).filter( name => sections.has( name ) ).map( name => [ name, sections.get( name ) ] ) );

	references.push( { file, code: formatReferences( ordered ) } );

}

for ( const { file, code } of references ) {

	await writeFile( file, code );
	console.log( `Updated ${ file.pathname.split( '/' ).pop() }` );

}
