import {
	planeApplyMatrix4,
	planeCoplanarPoint,
	planeCopy,
	planeCreate,
	planeDistanceToPoint,
	planeDistanceToSphere,
	planeEquals,
	planeFromJSON,
	planeIntersectLine,
	planeIntersectsBox,
	planeIntersectsLine,
	planeIntersectsSphere,
	planeNegate,
	planeNormalize,
	planeProjectPoint,
	planeSet,
	planeSetComponents,
	planeSetFromCoplanarPoints,
	planeSetFromNormalAndCoplanarPoint,
	planeToJSON,
	planeTranslate
} from '../../../../src/math/PlaneFunctions.js';
import { Plane } from '../../../../src/math/Plane.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { eps } from '../../utils/math-constants.js';

function planeLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.normal.x - b.normal.x ) <= tolerance &&
		Math.abs( a.normal.y - b.normal.y ) <= tolerance &&
		Math.abs( a.normal.z - b.normal.z ) <= tolerance &&
		Math.abs( a.constant - b.constant ) <= tolerance;

}

function vec3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'PlaneFunctions', () => {

		QUnit.test( 'planeCreate is a plain PlaneLike, not a Plane instance', ( assert ) => {

			const p = planeCreate();

			assert.strictEqual( p.normal.x, 1, 'default normal.x' );
			assert.strictEqual( p.normal.y, 0, 'default normal.y' );
			assert.strictEqual( p.normal.z, 0, 'default normal.z' );
			assert.strictEqual( p.constant, 0, 'default constant' );
			assert.notOk( p.isPlane, 'is not branded as a Plane' );
			assert.ok( planeEquals( p, new Plane() ), 'is numerically a default Plane' );

		} );

		QUnit.test( 'operations work on plain objects without importing Plane', ( assert ) => {

			const a = planeSetComponents( 2, 0, 0, - 2 );
			const normalized = planeNormalize( a );
			const point = { x: 4, y: 0, z: 0 };

			assert.ok( ! normalized.isPlane, 'result is a plain PlaneLike' );
			assert.ok( Math.abs( planeDistanceToPoint( normalized, point ) - 3 ) < eps, 'distance matches class behavior' );
			assert.ok( planeLikeEquals( normalized, new Plane( new Vector3( 2, 0, 0 ), - 2 ).normalize() ), 'matches the class result' );

		} );

		QUnit.test( 'omitting the target allocates a new PlaneLike, providing one reuses it', ( assert ) => {

			const source = planeSetComponents( 0, 1, 0, - 1 );

			const allocated = planeCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( planeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = planeCreate();
			const returned = planeCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( planeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'normalize/negate are safe when the target aliases the input', ( assert ) => {

			const a = planeSetComponents( 2, 0, 0, - 2 );
			const expectedNormalize = planeNormalize( a );
			const aliasedNormalize = planeCopy( a );
			planeNormalize( aliasedNormalize, aliasedNormalize );
			assert.ok( planeLikeEquals( aliasedNormalize, expectedNormalize ), 'in-place normalize matches out-of-place' );

			const b = planeNormalize( planeSetComponents( 2, 0, 0, - 2 ) );
			const expectedNegate = planeNegate( b );
			const aliasedNegate = planeCopy( b );
			planeNegate( aliasedNegate, aliasedNegate );
			assert.ok( planeEquals( aliasedNegate, expectedNegate ), 'in-place negate matches out-of-place' );

		} );

		QUnit.test( 'setFromCoplanarPoints matches the class on plain points', ( assert ) => {

			const a = { x: 2.0, y: 0.5, z: 0.25 };
			const b = { x: 2.0, y: - 0.5, z: 1.25 };
			const c = { x: 2.0, y: - 3.5, z: 2.2 };

			const plane = planeSetFromCoplanarPoints( a, b, c );
			const classPlane = new Plane().setFromCoplanarPoints(
				new Vector3( 2.0, 0.5, 0.25 ),
				new Vector3( 2.0, - 0.5, 1.25 ),
				new Vector3( 2.0, - 3.5, 2.2 )
			);

			assert.ok( planeLikeEquals( plane, classPlane ), 'matches class setFromCoplanarPoints' );
			assert.ok( vec3LikeEquals( plane.normal, { x: 1, y: 0, z: 0 } ), 'normal is +X' );
			assert.strictEqual( plane.constant, - 2, 'constant is -2' );

		} );

		QUnit.test( 'setFromNormalAndCoplanarPoint and projectPoint work on plain objects', ( assert ) => {

			const normal = { x: 0, y: 1, z: 0 };
			const plane = planeSetFromNormalAndCoplanarPoint( normal, { x: 0, y: 1, z: 0 } );
			const projected = planeProjectPoint( plane, { x: 0, y: 0, z: 0 } );

			assert.ok( Math.abs( planeDistanceToPoint( plane, projected ) ) < eps, 'projected point lies on the plane' );
			assert.ok( vec3LikeEquals( projected, { x: 0, y: 1, z: 0 } ), 'projects origin onto y=1' );

		} );

		QUnit.test( 'intersectLine clamps by default and can return infinite-line hits', ( assert ) => {

			const plane = planeSetComponents( 1, 0, 0, - 20 );
			const line = {
				start: { x: - 10, y: 0, z: 0 },
				end: { x: 10, y: 0, z: 0 }
			};
			const target = { x: 0, y: 0, z: 0 };

			assert.strictEqual( planeIntersectLine( plane, line, target ), null, 'default clamps to segment' );
			assert.strictEqual( planeIntersectLine( plane, line, target, true ), null, 'explicit clamp returns null' );

			const result = planeIntersectLine( plane, line, target, false );
			assert.strictEqual( result, target, 'returns the provided target' );
			assert.ok( vec3LikeEquals( target, { x: 20, y: 0, z: 0 } ), 'infinite-line intersection' );

		} );

		QUnit.test( 'intersectsLine / intersectsBox / intersectsSphere on plain objects', ( assert ) => {

			const plane = planeSetComponents( 0, 1, 0, 0 );
			const crossing = {
				start: { x: 0, y: - 1, z: 0 },
				end: { x: 0, y: 1, z: 0 }
			};
			const nonCrossing = {
				start: { x: 0, y: 1, z: 0 },
				end: { x: 0, y: 2, z: 0 }
			};

			assert.ok( planeIntersectsLine( plane, crossing ), 'crossing segment intersects' );
			assert.notOk( planeIntersectsLine( plane, nonCrossing ), 'non-crossing segment does not' );

			const box = {
				min: { x: 0, y: 0, z: 0 },
				max: { x: 1, y: 1, z: 1 }
			};
			assert.ok( planeIntersectsBox( planeSetComponents( 0, 1, 0, - 0.25 ), box ), 'box intersects plane' );
			assert.notOk( planeIntersectsBox( planeSetComponents( 0, 1, 0, 1 ), box ), 'box misses plane' );

			const sphere = { center: { x: 0, y: 0, z: 0 }, radius: 1 };
			assert.ok( planeIntersectsSphere( planeSetComponents( 0, 1, 0, 1 ), sphere ), 'sphere intersects plane' );
			assert.notOk( planeIntersectsSphere( planeSetComponents( 0, 1, 0, 1.25 ), sphere ), 'sphere misses plane' );
			assert.strictEqual( planeDistanceToSphere( planeSetComponents( 1, 0, 0, 0 ), { center: { x: 2, y: 0, z: 0 }, radius: 1 } ), 1, 'distanceToSphere' );

		} );

		QUnit.test( 'applyMatrix4 / translate match the class and support aliasing', ( assert ) => {

			const plane = planeSetComponents( 1, 0, 0, 0 );
			const m = new Matrix4().makeRotationZ( Math.PI * 0.5 );

			const transformed = planeApplyMatrix4( plane, m );
			assert.ok( planeLikeEquals( transformed, new Plane( new Vector3( 1, 0, 0 ), 0 ).applyMatrix4( m ) ), 'rotation matches class' );

			const aliased = planeCopy( plane );
			planeApplyMatrix4( aliased, m, undefined, aliased );
			assert.ok( planeLikeEquals( aliased, transformed ), 'in-place applyMatrix4 matches out-of-place' );

			const offsetPlane = planeSetComponents( 0, 1, 0, - 1 );
			const offset = { x: 1, y: 1, z: 1 };
			const translated = planeTranslate( offsetPlane, offset );
			assert.ok( planeLikeEquals( translated, new Plane( new Vector3( 0, 1, 0 ), - 1 ).translate( new Vector3( 1, 1, 1 ) ) ), 'translate matches class' );

			const translation = new Matrix4().makeTranslation( 1, 1, 1 );
			assert.ok( planeLikeEquals(
				planeApplyMatrix4( offsetPlane, translation ),
				planeTranslate( offsetPlane, offset )
			), 'applyMatrix4 translation matches translate' );

		} );

		QUnit.test( 'coplanarPoint, toJSON / fromJSON round-trip on plain objects', ( assert ) => {

			const plane = planeSetComponents( 0, 1, 0, - 1 );
			const point = planeCoplanarPoint( plane );

			assert.ok( Math.abs( planeDistanceToPoint( plane, point ) ) < eps, 'coplanar point lies on plane' );

			const json = planeToJSON( plane );
			const restored = planeFromJSON( json );
			assert.ok( planeEquals( restored, plane ), 'fromJSON restores toJSON output' );
			assert.ok( ! restored.isPlane, 'restored value is a plain PlaneLike' );

			const set = planeSet( { x: 1, y: 2, z: 3 }, 4 );
			assert.ok( planeEquals( set, planeSetComponents( 1, 2, 3, 4 ) ), 'planeSet matches setComponents' );

		} );

	} );

} );
