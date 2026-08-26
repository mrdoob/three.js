import { ShapeUtils } from '../../../../src/extras/ShapeUtils.js';
import { Vector2 } from '../../../../src/math/Vector2.js';

// Sums the unsigned area of every face returned by `triangulateShape()`,
// resolving indices against the concatenated contour + hole vertex list.
function facesArea( vertices, faces ) {

	let area = 0;

	for ( const [ i, j, k ] of faces ) {

		const a = vertices[ i ], b = vertices[ j ], c = vertices[ k ];

		area += Math.abs( ( b.x - a.x ) * ( c.y - a.y ) - ( c.x - a.x ) * ( b.y - a.y ) ) * 0.5;

	}

	return area;

}

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'ShapeUtils', () => {

		// Public
		QUnit.test( 'area - returns the signed area of a contour', ( assert ) => {

			const ccw = [ new Vector2( 0, 0 ), new Vector2( 2, 0 ), new Vector2( 2, 2 ), new Vector2( 0, 2 ) ];
			const cw = [ ...ccw ].reverse();

			assert.numEqual( ShapeUtils.area( ccw ), 4, 'counter-clockwise winding gives a positive area' );
			assert.numEqual( ShapeUtils.area( cw ), - 4, 'clockwise winding gives a negative area of equal magnitude' );

		} );

		QUnit.test( 'area - is invariant under translation and vertex rotation', ( assert ) => {

			const triangle = [ new Vector2( 0, 0 ), new Vector2( 4, 0 ), new Vector2( 0, 3 ) ];
			const shifted = triangle.map( p => new Vector2( p.x + 10, p.y - 7 ) );
			const rotated = [ triangle[ 1 ], triangle[ 2 ], triangle[ 0 ] ];

			assert.numEqual( ShapeUtils.area( triangle ), 6, 'a 4x3 right triangle has area 6' );
			assert.numEqual( ShapeUtils.area( shifted ), 6, 'translating the contour does not change its area' );
			assert.numEqual( ShapeUtils.area( rotated ), 6, 'starting the loop at a different vertex does not change its area' );

		} );

		QUnit.test( 'area - returns zero for degenerate contours', ( assert ) => {

			assert.numEqual( ShapeUtils.area( [] ), 0, 'an empty contour has no area' );
			assert.numEqual( ShapeUtils.area( [ new Vector2( 1, 1 ) ] ), 0, 'a single point has no area' );
			assert.numEqual( ShapeUtils.area( [ new Vector2( 0, 0 ), new Vector2( 1, 1 ) ] ), 0, 'a segment has no area' );
			assert.numEqual(
				ShapeUtils.area( [ new Vector2( 0, 0 ), new Vector2( 1, 1 ), new Vector2( 2, 2 ) ] ),
				0,
				'collinear points have no area'
			);

		} );

		QUnit.test( 'area - handles a concave contour', ( assert ) => {

			// The same L shape as the Earcut tests -- a shoelace sum handles the
			// notch correctly where a bounding-box estimate would report 4.
			const l = [
				new Vector2( 0, 0 ), new Vector2( 2, 0 ), new Vector2( 2, 1 ),
				new Vector2( 1, 1 ), new Vector2( 1, 2 ), new Vector2( 0, 2 )
			];

			assert.numEqual( ShapeUtils.area( l ), 3, 'the concave notch is subtracted' );

		} );

		QUnit.test( 'isClockWise - reports the winding order', ( assert ) => {

			const ccw = [ new Vector2( 0, 0 ), new Vector2( 1, 0 ), new Vector2( 1, 1 ) ];
			const cw = [ ...ccw ].reverse();

			assert.strictEqual( ShapeUtils.isClockWise( ccw ), false, 'a counter-clockwise contour is not clockwise' );
			assert.strictEqual( ShapeUtils.isClockWise( cw ), true, 'a clockwise contour is clockwise' );

		} );

		QUnit.test( 'isClockWise - treats a zero-area contour as counter-clockwise', ( assert ) => {

			// area < 0 is strict, so the degenerate case falls on the false side.
			const collinear = [ new Vector2( 0, 0 ), new Vector2( 1, 1 ), new Vector2( 2, 2 ) ];

			assert.strictEqual( ShapeUtils.isClockWise( collinear ), false, 'zero area is not clockwise' );

		} );

		QUnit.test( 'triangulateShape - returns faces as index triplets', ( assert ) => {

			const contour = [ new Vector2( 0, 0 ), new Vector2( 1, 0 ), new Vector2( 1, 1 ), new Vector2( 0, 1 ) ];
			const faces = ShapeUtils.triangulateShape( contour, [] );

			assert.strictEqual( faces.length, 2, 'a quad yields 2 faces' );
			assert.ok( faces.every( f => f.length === 3 ), 'each face has exactly 3 indices' );
			assert.strictEqual( new Set( faces.flat() ).size, 4, 'all 4 contour vertices are used' );
			assert.numEqual( facesArea( contour, faces ), 1, 'the faces cover the unit square' );

		} );

		QUnit.test( 'triangulateShape - indexes holes after the contour vertices', ( assert ) => {

			const contour = [ new Vector2( 0, 0 ), new Vector2( 4, 0 ), new Vector2( 4, 4 ), new Vector2( 0, 4 ) ];
			const hole = [ new Vector2( 1, 1 ), new Vector2( 1, 3 ), new Vector2( 3, 3 ), new Vector2( 3, 1 ) ];

			const faces = ShapeUtils.triangulateShape( contour, [ hole ] );
			const vertices = [ ...contour, ...hole ];

			// n = 8 vertices, h = 1 hole -> 8 faces.
			assert.strictEqual( faces.length, 8, 'a square with one square hole yields 8 faces' );

			const used = new Set( faces.flat() );
			assert.strictEqual( used.size, 8, 'every contour and hole vertex is used' );
			assert.ok( [ ...used ].every( i => i < 8 ), 'hole indices continue the contour numbering' );

			assert.numEqual( facesArea( vertices, faces ), 16 - 4, 'the faces cover the ring, not the hole' );

		} );

		QUnit.test( 'triangulateShape - drops a duplicated closing point', ( assert ) => {

			// Callers often close the loop explicitly. The duplicate is removed
			// in place before triangulation, so the input array shrinks too.
			const contour = [
				new Vector2( 0, 0 ), new Vector2( 1, 0 ), new Vector2( 1, 1 ),
				new Vector2( 0, 1 ), new Vector2( 0, 0 )
			];

			const faces = ShapeUtils.triangulateShape( contour, [] );

			assert.strictEqual( contour.length, 4, 'the repeated closing point is removed from the input array' );
			assert.strictEqual( faces.length, 2, 'the closed quad still yields 2 faces' );
			assert.numEqual( facesArea( contour, faces ), 1, 'the faces cover the unit square' );

		} );

		QUnit.test( 'triangulateShape - drops a duplicated closing point on holes as well', ( assert ) => {

			const contour = [ new Vector2( 0, 0 ), new Vector2( 4, 0 ), new Vector2( 4, 4 ), new Vector2( 0, 4 ) ];
			const hole = [
				new Vector2( 1, 1 ), new Vector2( 1, 3 ), new Vector2( 3, 3 ),
				new Vector2( 3, 1 ), new Vector2( 1, 1 )
			];

			const faces = ShapeUtils.triangulateShape( contour, [ hole ] );

			assert.strictEqual( hole.length, 4, 'the repeated closing point is removed from the hole array' );
			assert.strictEqual( faces.length, 8, 'the hole is still triangulated as a 4-gon' );
			assert.numEqual( facesArea( [ ...contour, ...hole ], faces ), 16 - 4, 'the faces cover the ring, not the hole' );

		} );

		QUnit.test( 'triangulateShape - returns no faces for a degenerate contour', ( assert ) => {

			assert.strictEqual( ShapeUtils.triangulateShape( [], [] ).length, 0, 'an empty contour yields no faces' );
			assert.strictEqual(
				ShapeUtils.triangulateShape( [ new Vector2( 0, 0 ), new Vector2( 1, 0 ) ], [] ).length,
				0,
				'a segment yields no faces'
			);

		} );

	} );

} );
