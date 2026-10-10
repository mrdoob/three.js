import { Vector3 } from 'three';

function triangleFrame( positions, triangle ) {

	const [ a, b, c ] = triangle.map( i => positions[ i ] );
	const ab = new Vector3().subVectors( b, a ), ac = new Vector3().subVectors( c, a );
	const length = ab.length(), cross = new Vector3().crossVectors( ab, ac ).length();
	return { length, x: ac.dot( ab ) / length, y: cross / length, cross };

}

/**
 * Solves least squares conformal coordinates for a connected triangle chart.
 * Positions are Vector3 values; triangles contain vertex indices; initial UVs
 * are [u, v] pairs. The initial coordinates choose and position two pins.
 * Returns new UV pairs, or null for coincident pins, degenerate triangles or
 * a failed solve. Callers must validate the result for distortion and overlap.
 * This is an internal implementation detail of unwrapUVs.
 */
// LSCM energy: area * ((du/dx - dv/dy)^2 + (du/dy + dv/dx)^2).
// Two pinned vertices remove similarity null modes. Matrix-free Jacobi PCG
// solves the normal equations; every result must pass geometric validation.
function solveLSCM( positions, triangles, initial ) {

	let pinA = 0, pinB = 0, distance = 0;
	for ( let i = 1; i < initial.length; i ++ ) {

		if ( initial[ i ][ 0 ] < initial[ pinA ][ 0 ] ) pinA = i;

	}

	for ( let i = 0; i < initial.length; i ++ ) {

		const d = ( initial[ i ][ 0 ] - initial[ pinA ][ 0 ] ) ** 2 + ( initial[ i ][ 1 ] - initial[ pinA ][ 1 ] ) ** 2;
		if ( d > distance ) {

			distance = d; pinB = i;

		}

	}

	if ( distance === 0 ) return null;
	const n = positions.length * 2, fixed = new Uint8Array( n );
	for ( const pin of [ pinA, pinB ] ) {

		fixed[ pin * 2 ] = 1; fixed[ pin * 2 + 1 ] = 1;

	}

	const rows = [];
	for ( const tri of triangles ) {

		const { length, x, y } = triangleFrame( positions, tri );
		if ( ! ( y > 0 && length > 0 ) ) return null;
		const weight = Math.sqrt( length * y * 0.5 );
		const gx = [ - 1 / length, 1 / length, 0 ], gy = [ ( x - length ) / ( length * y ), - x / ( length * y ), 1 / y ];
		const indices = tri.flatMap( i => [ i * 2, i * 2 + 1 ] );
		rows.push( { indices, values: gx.flatMap( ( value, i ) => [ value * weight, - gy[ i ] * weight ] ) } );
		rows.push( { indices, values: gy.flatMap( ( value, i ) => [ value * weight, gx[ i ] * weight ] ) } );

	}

	const diagonal = new Float64Array( n ), rhs = new Float64Array( n );
	for ( const row of rows ) {

		let offset = 0;
		for ( let j = 0; j < 6; j ++ ) {

			const i = row.indices[ j ];
			if ( fixed[ i ] ) offset += row.values[ j ] * initial[ i >> 1 ][ i % 2 ];

		}

		for ( let j = 0; j < 6; j ++ ) {

			const i = row.indices[ j ];
			if ( ! fixed[ i ] ) {

				diagonal[ i ] += row.values[ j ] ** 2; rhs[ i ] -= row.values[ j ] * offset;

			}

		}

	}

	function multiply( input, output ) {

		output.fill( 0 );
		for ( const row of rows ) {

			let sum = 0;
			for ( let j = 0; j < 6; j ++ ) if ( ! fixed[ row.indices[ j ] ] ) sum += row.values[ j ] * input[ row.indices[ j ] ];
			for ( let j = 0; j < 6; j ++ ) if ( ! fixed[ row.indices[ j ] ] ) output[ row.indices[ j ] ] += row.values[ j ] * sum;

		}

	}

	const solution = new Float64Array( n ), residual = new Float64Array( n ), direction = new Float64Array( n ), product = new Float64Array( n );
	for ( let i = 0; i < n; i ++ ) if ( ! fixed[ i ] ) solution[ i ] = initial[ i >> 1 ][ i % 2 ];
	multiply( solution, product );
	let rz = 0;
	for ( let i = 0; i < n; i ++ ) {

		residual[ i ] = rhs[ i ] - product[ i ];
		direction[ i ] = diagonal[ i ] > 0 ? residual[ i ] / diagonal[ i ] : 0;
		rz += residual[ i ] * direction[ i ];

	}

	const tolerance = rz * 1e-12;
	for ( let iteration = 0; iteration < Math.min( n, 300 ) && rz > tolerance && rz > 1e-24; iteration ++ ) {

		multiply( direction, product );
		let denominator = 0;
		for ( let i = 0; i < n; i ++ ) denominator += direction[ i ] * product[ i ];
		if ( ! ( denominator > 0 ) ) return null;
		const alpha = rz / denominator;
		let next = 0;
		for ( let i = 0; i < n; i ++ ) {

			solution[ i ] += alpha * direction[ i ];
			residual[ i ] -= alpha * product[ i ];
			if ( diagonal[ i ] > 0 ) next += residual[ i ] ** 2 / diagonal[ i ];

		}

		const beta = next / rz;
		for ( let i = 0; i < n; i ++ ) direction[ i ] = ( diagonal[ i ] > 0 ? residual[ i ] / diagonal[ i ] : 0 ) + beta * direction[ i ];
		rz = next;

	}

	return initial.map( ( p, i ) => fixed[ i * 2 ] ? p.slice() : [ solution[ i * 2 ], solution[ i * 2 + 1 ] ] );

}

export { solveLSCM, triangleFrame };
