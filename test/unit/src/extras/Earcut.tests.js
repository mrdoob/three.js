import { Earcut } from '../../../../src/extras/Earcut.js';

// Sums the unsigned area of every triangle in a flat `triangulate()` result,
// reading vertex coordinates back out of the original `data` array.
function triangulatedArea( data, indices, dim = 2 ) {

	let area = 0;

	for ( let i = 0; i < indices.length; i += 3 ) {

		const a = indices[ i ] * dim;
		const b = indices[ i + 1 ] * dim;
		const c = indices[ i + 2 ] * dim;

		area += Math.abs(
			( data[ b ] - data[ a ] ) * ( data[ c + 1 ] - data[ a + 1 ] ) -
			( data[ c ] - data[ a ] ) * ( data[ b + 1 ] - data[ a + 1 ] )
		) * 0.5;

	}

	return area;

}

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Earcut', () => {

		// Public
		QUnit.test( 'triangulate - splits a square into two triangles', ( assert ) => {

			const square = [ 0, 0, 1, 0, 1, 1, 0, 1 ];
			const indices = Earcut.triangulate( square, [] );

			assert.strictEqual( indices.length, 6, 'a quad yields 2 triangles / 6 indices' );

			// Every index has to address a real vertex, and each of the 4 corners
			// has to take part -- a triangulation that drops one would still have
			// the right length.
			assert.ok( indices.every( i => i >= 0 && i < 4 ), 'all indices are within range' );
			assert.strictEqual( new Set( indices ).size, 4, 'all 4 corners are used' );

			assert.numEqual( triangulatedArea( square, indices ), 1, 'the triangles cover the full unit square' );

		} );

		QUnit.test( 'triangulate - produces n + 2h - 2 triangles for a polygon with holes', ( assert ) => {

			// Outer unit square (indices 0-3) with a centred square hole (4-7).
			// The hole must wind opposite to the contour.
			const data = [
				0, 0, 4, 0, 4, 4, 0, 4,
				1, 1, 1, 3, 3, 3, 3, 1
			];

			const indices = Earcut.triangulate( data, [ 4 ] );

			// n = 8 vertices, h = 1 hole -> 8 triangles.
			assert.strictEqual( indices.length, 8 * 3, 'a square with one square hole yields 8 triangles' );
			assert.strictEqual( new Set( indices ).size, 8, 'every contour and hole vertex is used' );

			// Outer square is 16, hole is 4 -- the triangles must cover the
			// difference and nothing more, which is what catches a hole that was
			// silently filled in.
			assert.numEqual( triangulatedArea( data, indices ), 16 - 4, 'the triangles cover the ring, not the hole' );

		} );

		QUnit.test( 'triangulate - honours the dim argument for interleaved 3D data', ( assert ) => {

			// Same unit square, but with a z component that must be skipped over.
			const square3D = [ 0, 0, 9, 1, 0, 9, 1, 1, 9, 0, 1, 9 ];
			const indices = Earcut.triangulate( square3D, [], 3 );

			assert.strictEqual( indices.length, 6, 'dim = 3 still yields 2 triangles' );
			assert.strictEqual( new Set( indices ).size, 4, 'all 4 corners are used' );
			assert.numEqual( triangulatedArea( square3D, indices, 3 ), 1, 'the stride is applied when reading vertices' );

		} );

		QUnit.test( 'triangulate - returns indices, not coordinates', ( assert ) => {

			// A regression guard on the contract: the return value indexes into
			// `data` by vertex, so values must stay below the vertex count even
			// when the coordinates themselves are large.
			const indices = Earcut.triangulate( [ 0, 0, 100, 0, 100, 100, 0, 100 ], [] );

			assert.ok( indices.every( i => Number.isInteger( i ) && i < 4 ), 'indices are vertex indices, not coordinates' );

		} );

		QUnit.test( 'triangulate - returns no triangles for degenerate input', ( assert ) => {

			assert.strictEqual( Earcut.triangulate( [], [] ).length, 0, 'an empty polygon yields nothing' );
			assert.strictEqual( Earcut.triangulate( [ 0, 0, 1, 0 ], [] ).length, 0, 'two points cannot form a triangle' );
			assert.strictEqual( Earcut.triangulate( [ 0, 0, 1, 1, 2, 2 ], [] ).length, 0, 'three collinear points have no area' );

		} );

		QUnit.test( 'triangulate - handles a concave polygon without escaping its outline', ( assert ) => {

			// An L shape -- the classic case a naive fan triangulation gets wrong
			// by emitting a triangle across the notch.
			const shape = [ 0, 0, 2, 0, 2, 1, 1, 1, 1, 2, 0, 2 ];
			const indices = Earcut.triangulate( shape, [] );

			assert.strictEqual( indices.length, ( 6 - 2 ) * 3, 'an L shape yields 4 triangles' );
			assert.numEqual( triangulatedArea( shape, indices ), 3, 'the triangles cover the L exactly, not its bounding box' );

		} );

	} );

} );
