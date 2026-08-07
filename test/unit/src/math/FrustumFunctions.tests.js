import {
	frustumContainsPoint,
	frustumCopy,
	frustumCreate,
	frustumIntersectsBox,
	frustumIntersectsSphere,
	frustumSet,
	frustumSetFromProjectionMatrix
} from '../../../../src/math/FrustumFunctions.js';
import { planeCreate, planeEquals, planeSet } from '../../../../src/math/PlaneFunctions.js';
import { mat4MakeOrthographic, mat4MakePerspective } from '../../../../src/math/Matrix4Functions.js';
import { Frustum } from '../../../../src/math/Frustum.js';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../../../../src/constants.js';
import { eps } from '../../utils/math-constants.js';

function frustumLikeEquals( a, b, tolerance = eps ) {

	for ( let i = 0; i < 6; i ++ ) {

		const ap = a.planes[ i ];
		const bp = b.planes[ i ];

		if ( Math.abs( ap.normal.x - bp.normal.x ) > tolerance ||
			Math.abs( ap.normal.y - bp.normal.y ) > tolerance ||
			Math.abs( ap.normal.z - bp.normal.z ) > tolerance ||
			Math.abs( ap.constant - bp.constant ) > tolerance ) {

			return false;

		}

	}

	return true;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'FrustumFunctions', () => {

		QUnit.test( 'frustumCreate is a plain FrustumLike, not a Frustum instance', ( assert ) => {

			const f = frustumCreate();

			assert.strictEqual( f.planes.length, 6, 'has six planes' );
			assert.notOk( f.isFrustum, 'is not branded as a Frustum' );
			assert.notOk( f.planes[ 0 ].isPlane, 'planes are plain PlaneLike objects' );
			assert.ok( planeEquals( f.planes[ 0 ], planeCreate() ), 'default plane matches planeCreate()' );
			assert.ok( frustumLikeEquals( f, new Frustum() ), 'is numerically a default Frustum' );

		} );

		QUnit.test( 'operations work on plain objects without importing Frustum', ( assert ) => {

			const m = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100 );
			const f = frustumSetFromProjectionMatrix( m );

			assert.ok( ! f.isFrustum, 'result is a plain FrustumLike' );
			assert.ok( frustumContainsPoint( f, { x: 0, y: 0, z: - 50 } ), 'point inside the frustum' );
			assert.notOk( frustumContainsPoint( f, { x: 0, y: 0, z: 0 } ), 'point outside the frustum' );
			assert.ok( frustumIntersectsSphere( f, { center: { x: 0, y: 0, z: - 50 }, radius: 0 } ), 'sphere inside' );
			assert.notOk( frustumIntersectsSphere( f, { center: { x: 0, y: 0, z: 0 }, radius: 0 } ), 'sphere outside' );
			assert.ok( frustumIntersectsBox( f, {
				min: { x: - 0.5, y: - 0.5, z: - 50.5 },
				max: { x: 0.5, y: 0.5, z: - 49.5 }
			} ), 'box inside' );

		} );

		QUnit.test( 'omitting the target allocates a new FrustumLike, providing one reuses it', ( assert ) => {

			const p0 = planeSet( { x: 1, y: 0, z: 0 }, - 1 );
			const p1 = planeSet( { x: 1, y: 0, z: 0 }, 1 );
			const p2 = planeSet( { x: 1, y: 0, z: 0 }, 2 );
			const p3 = planeSet( { x: 1, y: 0, z: 0 }, 3 );
			const p4 = planeSet( { x: 1, y: 0, z: 0 }, 4 );
			const p5 = planeSet( { x: 1, y: 0, z: 0 }, 5 );

			const source = frustumSet( p0, p1, p2, p3, p4, p5 );

			const allocated = frustumCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( frustumLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = frustumCreate();
			const returned = frustumCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( frustumLikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'copy is safe when the target aliases the input', ( assert ) => {

			const m = mat4MakeOrthographic( - 1, 1, 1, - 1, 1, 100 );
			const source = frustumSetFromProjectionMatrix( m );
			const expected = frustumCopy( source );

			const aliased = frustumCopy( source );
			frustumCopy( aliased, aliased );
			assert.ok( frustumLikeEquals( aliased, expected ), 'in-place copy matches out-of-place copy' );

		} );

		QUnit.test( 'setFromProjectionMatrix matches the class for perspective and orthographic', ( assert ) => {

			const perspective = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100 );
			const orthographic = mat4MakeOrthographic( - 1, 1, 1, - 1, 1, 100 );

			assert.ok( frustumLikeEquals(
				frustumSetFromProjectionMatrix( perspective ),
				new Frustum().setFromProjectionMatrix( perspective )
			), 'perspective matches the class' );

			assert.ok( frustumLikeEquals(
				frustumSetFromProjectionMatrix( orthographic ),
				new Frustum().setFromProjectionMatrix( orthographic )
			), 'orthographic matches the class' );

		} );

		QUnit.test( 'setFromProjectionMatrix supports WebGPU coordinate system and reversed depth', ( assert ) => {

			const m = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100 );

			const webgpu = frustumSetFromProjectionMatrix( m, WebGPUCoordinateSystem );
			const classWebgpu = new Frustum().setFromProjectionMatrix( m, WebGPUCoordinateSystem );
			assert.ok( frustumLikeEquals( webgpu, classWebgpu ), 'WebGPU coordinate system matches the class' );

			const reversed = frustumSetFromProjectionMatrix( m, WebGLCoordinateSystem, true );
			const classReversed = new Frustum().setFromProjectionMatrix( m, WebGLCoordinateSystem, true );
			assert.ok( frustumLikeEquals( reversed, classReversed ), 'reversed depth matches the class' );

			assert.throws(
				() => frustumSetFromProjectionMatrix( m, 'invalid' ),
				'throws on an invalid coordinate system'
			);

		} );

		QUnit.test( 'set copies planes into the target without replacing plane references', ( assert ) => {

			const target = frustumCreate();
			const plane0 = target.planes[ 0 ];

			const p0 = planeSet( { x: 0, y: 1, z: 0 }, - 2 );
			const p1 = planeCreate();
			const p2 = planeCreate();
			const p3 = planeCreate();
			const p4 = planeCreate();
			const p5 = planeCreate();

			frustumSet( p0, p1, p2, p3, p4, p5, target );

			assert.strictEqual( target.planes[ 0 ], plane0, 'plane object identity is preserved' );
			assert.ok( planeEquals( target.planes[ 0 ], p0 ), 'plane values were copied' );

		} );

		QUnit.test( 'containsPoint / intersectsSphere / intersectsBox match the class', ( assert ) => {

			const m = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100 );
			const functional = frustumSetFromProjectionMatrix( m );
			const classic = new Frustum().setFromProjectionMatrix( m );

			const inside = { x: 0, y: 0, z: - 50 };
			const outside = { x: 0, y: 0, z: 0 };
			const sphereInside = { center: { x: 0, y: 0, z: - 50 }, radius: 0 };
			const sphereOutside = { center: { x: 0, y: 0, z: 0 }, radius: 0.9 };
			const box = {
				min: { x: - 1 - eps, y: - 1 - eps, z: - 1 - eps },
				max: { x: - eps, y: - eps, z: - eps }
			};

			assert.strictEqual(
				frustumContainsPoint( functional, inside ),
				classic.containsPoint( inside ),
				'containsPoint inside'
			);
			assert.strictEqual(
				frustumContainsPoint( functional, outside ),
				classic.containsPoint( outside ),
				'containsPoint outside'
			);
			assert.strictEqual(
				frustumIntersectsSphere( functional, sphereInside ),
				classic.intersectsSphere( sphereInside ),
				'intersectsSphere inside'
			);
			assert.strictEqual(
				frustumIntersectsSphere( functional, sphereOutside ),
				classic.intersectsSphere( sphereOutside ),
				'intersectsSphere outside'
			);
			assert.strictEqual(
				frustumIntersectsBox( functional, box ),
				classic.intersectsBox( box ),
				'intersectsBox'
			);

		} );

	} );

} );
