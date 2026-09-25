import { normalizeCode } from './code.js';

function getCaseName( title ) {

	return title.replace( / ([a-z])/g, ( _, letter ) => letter.toUpperCase() );

}

function getCaseTitle( name ) {

	return name.replace( /([a-z0-9])([A-Z])/g, '$1 $2' ).toLowerCase();

}

export function parseReferences( source ) {

	const references = new Map();
	const sections = source.replace( /\r\n/g, '\n' ).split( /^\/\/ ([a-z][a-zA-Z ]*)\n/gm );

	for ( let i = 1; i < sections.length; i += 2 ) {

		const name = getCaseName( sections[ i ] );
		if ( references.has( name ) ) throw new Error( `Duplicate TSL reference: ${ name }` );
		references.set( name, normalizeCode( sections[ i + 1 ] ) );

	}

	return references;

}

export function formatReferences( references ) {

	return Array.from( references, ( [ name, code ] ) => `// ${ getCaseTitle( name ) }\n\n${ normalizeCode( code ) }` ).join( '\n' );

}
