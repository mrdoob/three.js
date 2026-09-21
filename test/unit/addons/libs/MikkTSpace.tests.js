import * as MikkTSpace from '../../../../examples/jsm/libs/mikktspace.module.js';

function input( positions, uvs, normals ) {

	return [
		new Float32Array( positions ),
		new Float32Array( normals || Array.from( { length: positions.length / 3 }, () => [ 0, 0, 1 ] ).flat() ),
		new Float32Array( uvs )
	];

}

function assertTangents( assert, actual, expected, message ) {

	assert.ok( actual instanceof Float32Array, `${message}: Float32Array output` );
	assert.strictEqual( actual.length, expected.length, `${message}: output length` );

	let maxError = 0;
	const signs = [];
	const expectedSigns = [];

	for ( let i = 0; i < expected.length; i ++ ) {

		if ( i % 4 === 3 ) {

			signs.push( actual[ i ] );
			expectedSigns.push( expected[ i ] );

		} else {

			maxError = Math.max( maxError, Math.abs( actual[ i ] - expected[ i ] ) );

		}

	}

	// Allow small platform differences in acos(), but require handedness exactly.
	assert.ok( maxError <= 3e-5, `${message}: maximum component error ${maxError}` );
	assert.deepEqual( signs, expectedSigns, `${message}: handedness` );

}

const plane = () => input(
	[ 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0 ],
	[ 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1 ]
);

const repeat = ( tangent, count ) => Array.from( { length: count }, () => tangent ).flat();

// Goldens were generated independently with mmikk/MikkTSpace's C reference,
// commit 3e895b49d05ea07e4c2133156cfa94369e19e409, compiled with -ffp-contract=off.
// Both BuildNeighborsFast secondary sorting loops were corrected to process
// their final bucket. The neighbor-order regression below requires that fix.

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Libs', () => {

		QUnit.module( 'MikkTSpace', () => {

			QUnit.test( 'ready immediately and reusable after dispose', async ( assert ) => {

				assert.strictEqual( MikkTSpace.isReady, true );
				assertTangents( assert, MikkTSpace.generateTangents( ...plane() ), repeat( [ 1, 0, 0, 1 ], 6 ), 'before awaiting ready' );
				await MikkTSpace.ready;
				MikkTSpace.dispose();
				MikkTSpace.dispose();
				assert.strictEqual( MikkTSpace.isReady, true, 'dispose preserves readiness' );
				assertTangents( assert, MikkTSpace.generateTangents( ...plane() ), repeat( [ 1, 0, 0, 1 ], 6 ), 'after dispose' );

			} );

			QUnit.test( 'validates typed arrays and triangle attribute counts', ( assert ) => {

				const valid = plane();

				for ( let i = 0; i < valid.length; i ++ ) {

					const invalid = valid.slice();
					invalid[ i ] = new Float64Array( valid[ i ] );
					assert.throws( () => MikkTSpace.generateTangents( ...invalid ), TypeError, `attribute ${i} requires Float32Array` );

				}

				assert.throws( () => MikkTSpace.generateTangents( [], valid[ 1 ], valid[ 2 ] ), TypeError, 'rejects plain arrays' );
				assert.throws( () => MikkTSpace.generateTangents( valid[ 0 ].subarray( 0, 12 ), valid[ 1 ].subarray( 0, 12 ), valid[ 2 ].subarray( 0, 8 ) ), Error, 'rejects incomplete triangles' );
				assert.throws( () => MikkTSpace.generateTangents( valid[ 0 ], valid[ 1 ].subarray( 3 ), valid[ 2 ] ), Error, 'rejects mismatched normals' );
				assert.throws( () => MikkTSpace.generateTangents( valid[ 0 ], valid[ 1 ], valid[ 2 ].subarray( 2 ) ), Error, 'rejects mismatched UVs' );
				assertTangents( assert, MikkTSpace.generateTangents( ...input( [], [] ) ), [], 'empty input' );

			} );

			QUnit.test( 'respects subarray offsets without changing inputs', ( assert ) => {

				const backing = plane().map( ( attribute, i ) => {

					const array = new Float32Array( attribute.length + i + 4 ).fill( 123 );
					array.set( attribute, i + 1 );
					return array;

				} );
				const before = backing.map( array => array.slice() );
				const attributes = backing.map( ( array, i ) => array.subarray( i + 1, array.length - 3 ) );

				assertTangents( assert, MikkTSpace.generateTangents( ...attributes ), repeat( [ 1, 0, 0, 1 ], 6 ), 'offset views' );
				assert.deepEqual( backing, before, 'input attributes and surrounding data remain unchanged' );

			} );

			QUnit.test( 'keeps mirrored UVs, UV seams, and hard normal seams separate', ( assert ) => {

				const mirrored = plane();
				mirrored[ 2 ].set( [ 0, 0, 1, 1, 1, 0 ], 6 );
				assertTangents( assert, MikkTSpace.generateTangents( ...mirrored ), [ ...repeat( [ 1, 0, 0, 1 ], 3 ), ...repeat( [ 0, 1, 0, - 1 ], 3 ) ], 'mirrored UVs' );

				const seam = plane();
				seam[ 2 ].set( [ 0, 0, - 1, 1, - 1, 0 ], 6 );
				assertTangents( assert, MikkTSpace.generateTangents( ...seam ), [ ...repeat( [ 1, 0, 0, 1 ], 3 ), ...repeat( [ 0, - 1, 0, 1 ], 3 ) ], 'UV seam' );

				const hardNormal = input(
					[ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1 ],
					[ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ],
					[ ...repeat( [ 0, 0, 1 ], 3 ), ...repeat( [ 1, 0, 0 ], 3 ) ]
				);
				assertTangents( assert, MikkTSpace.generateTangents( ...hardNormal ), [ ...repeat( [ 1, 0, 0, 1 ], 3 ), ...repeat( [ 0, 1, 0, 1 ], 3 ) ], 'hard normal seam' );

			} );

			QUnit.test( 'does not blend disconnected fans at a coincident vertex', ( assert ) => {

				const attributes = input(
					[ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, - 1, 0, 0, 0, - 1, 0 ],
					[ 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, - 1, 0 ]
				);
				assertTangents( assert, MikkTSpace.generateTangents( ...attributes ), [ ...repeat( [ 1, 0, 0, 1 ], 3 ), ...repeat( [ 0, 1, 0, 1 ], 3 ) ], 'disconnected fans' );

			} );

			QUnit.test( 'weights welded corners by their angles', ( assert ) => {

				const attributes = input(
					[ 0, 0, 0, 3, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, - 0.5, 2, 0 ],
					[ 0, 0, 1, 0.2, 0.2, 1, 0, 0, 0.2, 1, - 0.4, 0.4 ]
				);
				const expected = [
					0.80369955, - 0.59503525, 0, 1,
					0.99745876, - 0.07124705, 0, 1,
					0.88720137, - 0.46138224, 0, 1,
					0.80369955, - 0.59503525, 0, 1,
					0.88720137, - 0.46138224, 0, 1,
					0.49026120, - 0.87157553, 0, 1
				];

				assertTangents( assert, MikkTSpace.generateTangents( ...attributes ), expected, 'angle-weighted tangents' );

			} );

			QUnit.test( 'connects neighbors in the final edge bucket regardless of face order', ( assert ) => {

				// Reduced from a warped-UV grid. Each index identifies (x + 4 * y).
				const indices = [ 9, 13, 12, 14, 11, 15, 5, 8, 4, 13, 10, 14, 2, 5, 1, 10, 13, 9, 8, 9, 12, 4, 0, 1, 10, 7, 11, 9, 8, 5, 6, 5, 2, 4, 1, 5 ];
				const directions = [
					[ 0.99656379, - 0.08282860, 0, 1 ],
					[ 0.99506152, - 0.09926047, 0, 1 ],
					[ 0.99875236, - 0.04993758, 0, 1 ],
					[ 0.97014242, - 0.24253561, 0, 1 ],
					[ 0.98893631, - 0.14834054, 0, 1 ]
				];
				const expectedIndices = [ 0, 1, 2, 3, 3, 3, 0, 2, 2, 1, 4, 4, 4, 0, 1, 4, 1, 0, 2, 0, 2, 2, 2, 1, 3, 3, 3, 0, 2, 0, 4, 0, 4, 2, 1, 0 ];

				for ( const order of [[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ], [ 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 ]] ) {

					const corners = order.flatMap( face => [ face * 3, face * 3 + 1, face * 3 + 2 ] );
					const positions = [];
					const uvs = [];

					for ( const corner of corners ) {

						const x = indices[ corner ] % 4;
						const y = Math.floor( indices[ corner ] / 4 );
						positions.push( x, y, 0 );
						uvs.push( x + 0.15 * y * y, y + 0.05 * x * x );

					}

					const expected = corners.flatMap( corner => directions[ expectedIndices[ corner ] ] );
					assertTangents( assert, MikkTSpace.generateTangents( ...input( positions, uvs ) ), expected, `face order starting at ${order[ 0 ]}` );

				}

			} );

			QUnit.test( 'inherits degenerate corners and supplies isolated defaults', ( assert ) => {

				const attributes = input(
					[ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 8, 8, 8, 8, 8, 8, 8, 9, 8 ],
					[ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1 ]
				);
				assertTangents( assert, MikkTSpace.generateTangents( ...attributes ), [ ...repeat( [ 1, 0, 0, 1 ], 6 ), ...repeat( [ 1, 0, 0, - 1 ], 3 ) ], 'inherited and isolated' );

				const collapsed = input( repeat( [ 0, 0, 0 ], 3 ), repeat( [ 0, 0 ], 3 ) );
				assertTangents( assert, MikkTSpace.generateTangents( ...collapsed ), repeat( [ 1, 0, 0, - 1 ], 3 ), 'fully collapsed geometry' );

				const zeroUVs = input( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], repeat( [ 0, 0 ], 3 ) );
				assertTangents( assert, MikkTSpace.generateTangents( ...zeroUVs ), repeat( [ 1, 0, 0, - 1 ], 3 ), 'zero-area UVs' );

			} );

			QUnit.test( 'skips zero-length corner contributions before multiplying their weights', ( assert ) => {

				// Finite inputs can produce underflow or overflow in float32 intermediates.
				const attributes = input(
					[ 0, 0, 0, 1e10, 0, 0, 0, 1e-20, 0, 1e10, 0, 0, 0, 0, 0, 0, - 1, 0 ],
					[ 0, 0, 1e20, 0, 0, 1, 1e20, 0, 0, 0, 0, - 1e30 ]
				);
				const expected = [ 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, - 1 ];
				assertTangents( assert, MikkTSpace.generateTangents( ...attributes ), expected, 'extreme finite inputs' );

			} );

		} );

	} );

} );
