import { Vector3 } from 'three';

/**
 * Lightweight MDL Molfile/SDF parser.
 *
 * @param {string} text - Raw SDF or MOL text content.
 * @returns {Object} Parsed molecule data with `atoms` and `bonds` arrays.
 */
function parseSDF( text ) {

	const lines = text.split( /\r?\n/ );

	let i = 3; // skip header (three lines)
	const counts = lines[ i ++ ].trim().split( /\s+/ );
	const natoms = parseInt( counts[ 0 ] );
	const nbonds = parseInt( counts[ 1 ] );

	if ( isNaN( natoms ) || isNaN( nbonds ) ) {

		throw new Error( 'SDFParser: Invalid counts line' );

	}

	const atoms = [];
	for ( let k = 0; k < natoms; k ++, i ++ ) {

		const l = lines[ i ];
		if ( ! l || l.length < 31 ) throw new Error( `SDFParser: Invalid atom line ${ i + 1 }` );

		const x = parseFloat( l.substr( 0, 10 ) );
		const y = parseFloat( l.substr( 10, 10 ) );
		const z = parseFloat( l.substr( 20, 10 ) );
		const element = l.substr( 31, 3 ).trim() || 'C';

		atoms.push( { position: new Vector3( x, y, z ), element } );

	}

	const bonds = [];
	while ( bonds.length < nbonds && i < lines.length ) {

		const l = lines[ i ++ ];
		if ( ! l ) continue;
		if ( l.startsWith( 'M' ) ) break; // property block
		if ( l.length < 9 ) continue;

		const a1 = parseInt( l.slice( 0, 3 ) ) - 1;
		const a2 = parseInt( l.slice( 3, 6 ) ) - 1;
		const type = parseInt( l.slice( 6, 9 ) ) || 1;

		if ( isNaN( a1 ) || isNaN( a2 ) || a1 < 0 || a2 < 0 || a1 >= natoms || a2 >= natoms ) continue;

		bonds.push( [ a1, a2, type ] );

	}

	return { atoms, bonds };

}

export { parseSDF };
