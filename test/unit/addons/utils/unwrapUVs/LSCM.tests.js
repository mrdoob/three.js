import { Vector3 } from 'three';
import { solveLSCM, triangleFrame } from '../../../../../examples/jsm/utils/unwrapUVs/LSCM.js';

const triangles = [[ 0, 1, 4 ], [ 1, 2, 4 ], [ 2, 3, 4 ], [ 3, 0, 4 ]];
const expected = [[ 0, 0 ], [ 2, 0 ], [ 2, 1 ], [ 0, 1 ], [ 1, 0.5 ]];

function near( assert, actual, reference, tolerance = 1e-9 ) {

	assert.ok( actual !== null, 'Solver succeeds' );
	if ( actual === null ) return;
	for ( let i = 0; i < reference.length; i ++ ) {

		const du = actual[ i ][ 0 ] - reference[ i ][ 0 ], dv = actual[ i ][ 1 ] - reference[ i ][ 1 ];
		assert.ok( du * du + dv * dv <= tolerance * tolerance, `Vertex ${ i } matches the analytic flattening` );

	}

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'unwrapUVs / LSCM', () => {

			QUnit.test( 'planar chart converges and preserves inputs and pins', assert => {

				const positions = expected.map( ( [ x, y ] ) => new Vector3( x, 0.6 * y, 0.8 * y ) );
				const initial = expected.map( p => p.slice() );
				initial[ 4 ] = [ 0.3, 0.8 ];
				const before = positions.map( p => p.toArray() ), beforeUV = initial.map( p => p.slice() );
				const result = solveLSCM( positions, triangles, initial );
				near( assert, result, expected );
				assert.deepEqual( result[ 0 ], initial[ 0 ], 'First pin remains exact' );
				assert.deepEqual( result[ 2 ], initial[ 2 ], 'Second pin remains exact' );
				assert.deepEqual( initial, beforeUV, 'Initial UVs unchanged' );
				assert.deepEqual( positions.map( p => p.toArray() ), before, 'Positions unchanged' );
				assert.notStrictEqual( result[ 0 ], initial[ 0 ], 'Pinned UVs are copied' );

			} );

			QUnit.test( 'folded chart unfolds isometrically', assert => {

				const positions = [[ 0, 0, 0 ], [ 1, 0, 0 ], [ 1, 1, 0 ], [ 0.5, 0.5, Math.SQRT1_2 ]].map( p => new Vector3( ...p ) );
				const initial = [[ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0.3, 0.7 ]];
				near( assert, solveLSCM( positions, [[ 0, 1, 2 ], [ 0, 2, 3 ]], initial ), [[ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ]] );

			} );

			QUnit.test( 'uniform scales preserve the conformal solution', assert => {

				for ( const scale of [ 1e-4, 1, 1e4 ] ) {

					const positions = expected.map( ( [ x, y ] ) => new Vector3( x * scale, y * scale, 0 ) );
					const initial = expected.map( ( [ u, v ] ) => [ u * scale, v * scale ] );
					initial[ 4 ] = [ 0.3 * scale, 0.8 * scale ];
					near( assert, solveLSCM( positions, triangles, initial ), expected.map( ( [ u, v ] ) => [ u * scale, v * scale ] ), scale * 1e-9 );

				}

			} );

			QUnit.test( 'degenerate triangles and coincident pins fail without modifying inputs', assert => {

				const positions = [ new Vector3(), new Vector3( 1, 0, 0 ), new Vector3( 2, 0, 0 ) ];
				const initial = [[ 0, 0 ], [ 1, 0 ], [ 2, 1 ]];
				assert.strictEqual( solveLSCM( positions, [[ 0, 1, 2 ]], initial ), null );
				assert.strictEqual( solveLSCM( positions, [[ 0, 0, 2 ]], initial ), null );
				assert.strictEqual( solveLSCM( positions, [[ 0, 1, 2 ]], [[ 0, 0 ], [ 0, 0 ], [ 0, 0 ]] ), null );
				assert.deepEqual( initial, [[ 0, 0 ], [ 1, 0 ], [ 2, 1 ]] );

			} );

			QUnit.test( 'shared triangle frame describes local lengths and doubled area', assert => {

				const positions = [ new Vector3( 1, 2, 3 ), new Vector3( 4, 2, 3 ), new Vector3( 1, 2, 7 ) ];
				assert.deepEqual( triangleFrame( positions, [ 0, 1, 2 ] ), { length: 3, x: 0, y: 4, cross: 12 } );

			} );

		} );

	} );

} );
