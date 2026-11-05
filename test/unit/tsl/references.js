import { normalizeCode } from './code.js';

export function parseReferences( source ) {

	const references = new Map();
	const sections = source.replace( /\r\n/g, '\n' ).split( /^\/\/ ([a-z][a-zA-Z ]*)\n/gm );

	for ( let i = 1; i < sections.length; i += 2 ) {

		const name = sections[ i ];
		if ( references.has( name ) ) throw new Error( `Duplicate TSL reference: ${ name }` );
		references.set( name, normalizeCode( sections[ i + 1 ] ) );

	}

	return references;

}

export function formatReferences( references ) {

	return Array.from( references, ( [ name, code ] ) => `// ${ name }\n\n${ normalizeCode( code ) }` ).join( '\n' );

}
