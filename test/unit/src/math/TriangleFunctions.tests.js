import {
	triangleClosestPointToPoint,
	triangleContainsPoint,
	triangleCopy,
	triangleCreate,
	triangleEquals,
	triangleGetArea,
	triangleGetBarycoord,
	triangleGetInterpolatedAttribute,
	triangleGetInterpolation,
	triangleGetMidpoint,
	triangleGetNormal,
	triangleGetPlane,
	triangleIsFrontFacing,
	triangleSet,
	triangleSetFromAttributeAndIndices,
	triangleSetFromPointsAndIndices
} from '../../../../src/math/TriangleFunctions.js';
import { Triangle } from '../../../../src/math/Triangle.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { eps } from '../../utils/math-constants.js';

function vec3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'TriangleFunctions', () => {

		QUnit.test( 'triangleCreate is a plain TriangleLike, not a Triangle instance', ( assert ) => {

			const t = triangleCreate();

			assert.strictEqual( t.a.x, 0 );
			assert.strictEqual( t.a.y, 0 );
			assert.strictEqual( t.a.z, 0 );
			assert.strictEqual( t.b.x, 0 );
			assert.strictEqual( t.c.x, 0 );
			assert.notOk( t.isTriangle, 'is not branded as a Triangle' );
			assert.ok( triangleEquals( t, new Triangle() ), 'is numerically a zero triangle' );

		} );

		QUnit.test( 'operations work on plain objects without importing Triangle', ( assert ) => {

			const t = triangleSet(
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 }
			);

			assert.strictEqual( triangleGetArea( t ), 0.5, 'area matches' );

			const normal = triangleGetNormal( t.a, t.b, t.c );
			assert.ok( ! normal.isVector3, 'result is a plain Vector3Like' );
			assert.ok( vec3LikeEquals( normal, { x: 0, y: 0, z: 1 } ), 'normal matches' );

			const midpoint = triangleGetMidpoint( t );
			assert.ok( vec3LikeEquals( midpoint, { x: 1 / 3, y: 1 / 3, z: 0 } ), 'midpoint matches' );

		} );

		QUnit.test( 'omitting the target allocates a new TriangleLike, providing one reuses it', ( assert ) => {

			const source = triangleSet(
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 },
				{ x: 0, y: 0, z: 1 }
			);

			const allocated = triangleCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( triangleEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = triangleCreate();
			const returned = triangleCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( triangleEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'copy is safe when the target aliases the input', ( assert ) => {

			const t = triangleSet(
				{ x: 1, y: 2, z: 3 },
				{ x: 4, y: 5, z: 6 },
				{ x: 7, y: 8, z: 9 }
			);
			const expected = triangleCopy( t );

			triangleCopy( t, t );
			assert.ok( triangleEquals( t, expected ), 'in-place copy matches out-of-place copy' );

		} );

		QUnit.test( 'setFromPointsAndIndices / setFromAttributeAndIndices work on plain objects', ( assert ) => {

			const points = [
				{ x: 1, y: 1, z: 1 },
				{ x: - 1, y: - 1, z: - 1 },
				{ x: 2, y: 2, z: 2 }
			];
			const t = triangleSetFromPointsAndIndices( points, 1, 0, 2 );

			assert.ok( vec3LikeEquals( t.a, points[ 1 ] ) );
			assert.ok( vec3LikeEquals( t.b, points[ 0 ] ) );
			assert.ok( vec3LikeEquals( t.c, points[ 2 ] ) );

			const attribute = new BufferAttribute( new Float32Array( [ 1, 1, 1, - 1, - 1, - 1, 2, 2, 2 ] ), 3 );
			const fromAttr = triangleSetFromAttributeAndIndices( attribute, 1, 0, 2 );

			assert.ok( triangleEquals( fromAttr, t ), 'attribute path matches points path' );

		} );

		QUnit.test( 'getBarycoord / containsPoint handle degenerate triangles', ( assert ) => {

			const degenerate = triangleCreate();
			const bary = { x: 1, y: 1, z: 1 };

			assert.strictEqual( triangleGetBarycoord( { x: 0, y: 0, z: 0 }, degenerate.a, degenerate.b, degenerate.c, bary ), null );
			assert.ok( vec3LikeEquals( bary, { x: 0, y: 0, z: 0 } ), 'degenerate barycoord zeroes the target' );
			assert.notOk( triangleContainsPoint( { x: 0, y: 0, z: 0 }, degenerate.a, degenerate.b, degenerate.c ) );

			const t = triangleSet(
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 }
			);
			const mid = triangleGetMidpoint( t );
			const coords = triangleGetBarycoord( mid, t.a, t.b, t.c );

			assert.ok( vec3LikeEquals( coords, { x: 1 / 3, y: 1 / 3, z: 1 / 3 } ) );
			assert.ok( triangleContainsPoint( mid, t.a, t.b, t.c ) );
			assert.notOk( triangleContainsPoint( { x: - 1, y: - 1, z: - 1 }, t.a, t.b, t.c ) );

		} );

		QUnit.test( 'getInterpolation works on plain vector-likes and handles degenerates', ( assert ) => {

			const t = triangleSet(
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 }
			);
			const target = { x: 9, y: 9, z: 9 };
			const mid = triangleGetMidpoint( t );

			const result = triangleGetInterpolation(
				mid, t.a, t.b, t.c,
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 },
				{ x: 0, y: 0, z: 1 },
				target
			);

			assert.strictEqual( result, target );
			assert.ok( vec3LikeEquals( target, { x: 1 / 3, y: 1 / 3, z: 1 / 3 } ) );

			const degenerateTarget = { x: 1, y: 2, z: 3, w: 4 };
			const degenerateResult = triangleGetInterpolation(
				{ x: 0, y: 0, z: 0 },
				{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0, w: 0 },
				{ x: 0, y: 1, z: 0, w: 0 },
				{ x: 0, y: 0, z: 1, w: 0 },
				degenerateTarget
			);

			assert.strictEqual( degenerateResult, null );
			assert.strictEqual( degenerateTarget.x, 0 );
			assert.strictEqual( degenerateTarget.y, 0 );
			assert.strictEqual( degenerateTarget.z, 0 );
			assert.strictEqual( degenerateTarget.w, 0 );

		} );

		QUnit.test( 'getInterpolatedAttribute works with BufferAttribute and plain targets', ( assert ) => {

			const attr = new BufferAttribute( new Float32Array( [
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			] ), 3 );
			const barycoord = { x: 1 / 3, y: 1 / 3, z: 1 / 3 };
			const target = { x: 0, y: 0, z: 0 };

			triangleGetInterpolatedAttribute( attr, 0, 1, 2, barycoord, target );
			assert.ok( vec3LikeEquals( target, { x: 1 / 3, y: 1 / 3, z: 1 / 3 } ) );

		} );

		QUnit.test( 'closestPointToPoint matches the class and covers voronoi regions', ( assert ) => {

			const t = triangleSet(
				{ x: - 1, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 }
			);
			const classT = new Triangle(
				new Vector3( - 1, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 0, 1, 0 )
			);
			const classPoint = new Vector3();

			const cases = [
				{ x: 0, y: 0.5, z: 0 },
				{ x: - 1, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 },
				{ x: 0, y: 0, z: 0 },
				{ x: - 2, y: 0, z: 0 },
				{ x: 2, y: 0, z: 0 },
				{ x: 0, y: 2, z: 0 },
				{ x: 0, y: - 2, z: 0 }
			];

			for ( let i = 0; i < cases.length; i ++ ) {

				const p = cases[ i ];
				const functional = triangleClosestPointToPoint( t, p );
				classT.closestPointToPoint( new Vector3( p.x, p.y, p.z ), classPoint );
				assert.ok( vec3LikeEquals( functional, classPoint ), `case ${ i } matches the class` );

			}

			const aliased = { x: 0, y: - 2, z: 0 };
			const expected = triangleClosestPointToPoint( t, aliased );
			triangleClosestPointToPoint( t, aliased, aliased );
			assert.ok( vec3LikeEquals( aliased, expected ), 'target aliasing the query point is safe' );

		} );

		QUnit.test( 'getPlane writes a PlaneLike without importing Plane', ( assert ) => {

			const t = triangleSet(
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 }
			);
			const plane = triangleGetPlane( t );

			assert.ok( vec3LikeEquals( plane.normal, { x: 0, y: 0, z: 1 } ) );
			assert.strictEqual( plane.constant, 0 );
			assert.notOk( plane.isPlane, 'result is a plain PlaneLike' );

		} );

		QUnit.test( 'isFrontFacing matches the class', ( assert ) => {

			const t = triangleSet(
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 0, z: 0 },
				{ x: 0, y: 1, z: 0 }
			);

			assert.ok( triangleIsFrontFacing( t.a, t.b, t.c, { x: 0, y: 0, z: - 1 } ) );
			assert.notOk( triangleIsFrontFacing( t.a, t.c, t.b, { x: 0, y: 0, z: - 1 } ) );

		} );

		QUnit.test( 'functional results match the Triangle class wrapper', ( assert ) => {

			const plain = triangleSet(
				{ x: 2, y: 0, z: 0 },
				{ x: 0, y: 0, z: 0 },
				{ x: 0, y: 0, z: 2 }
			);
			const klass = new Triangle(
				new Vector3( 2, 0, 0 ),
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 2 )
			);

			assert.strictEqual( triangleGetArea( plain ), klass.getArea() );

			const n1 = triangleGetNormal( plain.a, plain.b, plain.c );
			const n2 = new Vector3();
			klass.getNormal( n2 );
			assert.ok( vec3LikeEquals( n1, n2 ) );

		} );

	} );

} );
