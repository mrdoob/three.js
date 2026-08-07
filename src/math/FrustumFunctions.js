import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../constants.js';
import {
	planeCopy,
	planeCreate,
	planeDistanceToPoint,
	planeNormalize,
	planeSetComponents
} from './PlaneFunctions.js';
import {
	sphereApplyMatrix4,
	sphereCopy,
	sphereCreate
} from './SphereFunctions.js';
import { vec2Create, vec2DistanceTo } from './Vector2Functions.js';

/**
 * A structural type describing any object that stores a frustum as an array
 * of six planes, exactly like {@link Frustum#planes}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Frustum} instance. Since {@link Frustum}
 * exposes a compatible `planes` array, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} FrustumLike
 * @property {Array<import('./PlaneFunctions.js').PlaneLike>} planes - The six planes that enclose the frustum.
 */

const _sphere = /*@__PURE__*/ sphereCreate();
const _defaultSpriteCenter = /*@__PURE__*/ vec2Create( 0.5, 0.5 );
const _vector = { x: 0, y: 0, z: 0 };

/**
 * Creates a new, plain {@link FrustumLike} object holding six default planes.
 *
 * Unlike `new Frustum()`, the returned object is not a class instance and
 * its planes are plain {@link PlaneLike} objects - it only satisfies the
 * {@link FrustumLike} shape. This keeps functional-only call sites free of
 * any dependency on the {@link Frustum} class so that unused frustum
 * operations can be tree-shaken.
 *
 * @return {FrustumLike} A new frustum-like object with six default planes.
 */
export function frustumCreate() {

	return {

		planes: [
			planeCreate(),
			planeCreate(),
			planeCreate(),
			planeCreate(),
			planeCreate(),
			planeCreate()
		]

	};

}

/**
 * Sets the frustum planes by copying the given planes.
 *
 * @param {import('./PlaneFunctions.js').PlaneLike} p0 - The first plane that encloses the frustum.
 * @param {import('./PlaneFunctions.js').PlaneLike} p1 - The second plane that encloses the frustum.
 * @param {import('./PlaneFunctions.js').PlaneLike} p2 - The third plane that encloses the frustum.
 * @param {import('./PlaneFunctions.js').PlaneLike} p3 - The fourth plane that encloses the frustum.
 * @param {import('./PlaneFunctions.js').PlaneLike} p4 - The fifth plane that encloses the frustum.
 * @param {import('./PlaneFunctions.js').PlaneLike} p5 - The sixth plane that encloses the frustum.
 * @param {FrustumLike} [target] - The target the result is stored to.
 * @return {FrustumLike} The target, for chaining.
 */
export function frustumSet( p0, p1, p2, p3, p4, p5, target = frustumCreate() ) {

	const planes = target.planes;

	planeCopy( p0, planes[ 0 ] );
	planeCopy( p1, planes[ 1 ] );
	planeCopy( p2, planes[ 2 ] );
	planeCopy( p3, planes[ 3 ] );
	planeCopy( p4, planes[ 4 ] );
	planeCopy( p5, planes[ 5 ] );

	return target;

}

/**
 * Copies the values of the given frustum into the target.
 *
 * @param {FrustumLike} frustum - The frustum to copy.
 * @param {FrustumLike} [target] - The target the result is stored to.
 * @return {FrustumLike} A copy of `frustum`.
 */
export function frustumCopy( frustum, target = frustumCreate() ) {

	const planes = target.planes;

	for ( let i = 0; i < 6; i ++ ) {

		planeCopy( frustum.planes[ i ], planes[ i ] );

	}

	return target;

}

/**
 * Sets the frustum planes from the given projection matrix.
 *
 * @param {import('./Matrix4Functions.js').Matrix4Like} m - The projection matrix.
 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
 * @param {FrustumLike} [target] - The target the result is stored to.
 * @return {FrustumLike} The target, for chaining.
 */
export function frustumSetFromProjectionMatrix( m, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false, target = frustumCreate() ) {

	const planes = target.planes;
	const me = m.elements;
	const me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
	const me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
	const me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
	const me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

	planeNormalize( planeSetComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12, planes[ 0 ] ), planes[ 0 ] );
	planeNormalize( planeSetComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12, planes[ 1 ] ), planes[ 1 ] );
	planeNormalize( planeSetComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13, planes[ 2 ] ), planes[ 2 ] );
	planeNormalize( planeSetComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13, planes[ 3 ] ), planes[ 3 ] );

	if ( reversedDepth ) {

		planeNormalize( planeSetComponents( me2, me6, me10, me14, planes[ 4 ] ), planes[ 4 ] ); // far
		planeNormalize( planeSetComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14, planes[ 5 ] ), planes[ 5 ] ); // near

	} else {

		planeNormalize( planeSetComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14, planes[ 4 ] ), planes[ 4 ] ); // far

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			planeNormalize( planeSetComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14, planes[ 5 ] ), planes[ 5 ] ); // near

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			planeNormalize( planeSetComponents( me2, me6, me10, me14, planes[ 5 ] ), planes[ 5 ] ); // near

		} else {

			throw new Error( 'THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: ' + coordinateSystem );

		}

	}

	return target;

}

/**
 * Returns `true` if the 3D object's bounding sphere is intersecting the frustum.
 *
 * Note that the 3D object must have a geometry so that the bounding sphere can be calculated.
 *
 * @param {FrustumLike} frustum - The frustum to test against.
 * @param {Object} object - The 3D object to test.
 * @return {boolean} Whether the 3D object's bounding sphere is intersecting the frustum or not.
 */
export function frustumIntersectsObject( frustum, object ) {

	if ( object.boundingSphere !== undefined ) {

		if ( object.boundingSphere === null ) object.computeBoundingSphere();

		sphereApplyMatrix4( sphereCopy( object.boundingSphere, _sphere ), object.matrixWorld, _sphere );

	} else {

		const geometry = object.geometry;

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		sphereApplyMatrix4( sphereCopy( geometry.boundingSphere, _sphere ), object.matrixWorld, _sphere );

	}

	return frustumIntersectsSphere( frustum, _sphere );

}

/**
 * Returns `true` if the given sprite is intersecting the frustum.
 *
 * @param {FrustumLike} frustum - The frustum to test against.
 * @param {Object} sprite - The sprite to test.
 * @return {boolean} Whether the sprite is intersecting the frustum or not.
 */
export function frustumIntersectsSprite( frustum, sprite ) {

	_sphere.center.x = 0;
	_sphere.center.y = 0;
	_sphere.center.z = 0;

	const offset = vec2DistanceTo( _defaultSpriteCenter, sprite.center );

	_sphere.radius = 0.7071067811865476 + offset;
	sphereApplyMatrix4( _sphere, sprite.matrixWorld, _sphere );

	return frustumIntersectsSphere( frustum, _sphere );

}

/**
 * Returns `true` if the given bounding sphere is intersecting the frustum.
 *
 * This is a fast, conservative test that favors performance over precision. It can
 * report false positives for spheres that lie outside the frustum but are not separated
 * by a single frustum plane. It never reports false negatives, so it is safe for culling.
 *
 * @param {FrustumLike} frustum - The frustum to test against.
 * @param {import('./SphereFunctions.js').SphereLike} sphere - The bounding sphere to test.
 * @return {boolean} Whether the bounding sphere is intersecting the frustum or not.
 */
export function frustumIntersectsSphere( frustum, sphere ) {

	const planes = frustum.planes;
	const center = sphere.center;
	const negRadius = - sphere.radius;

	for ( let i = 0; i < 6; i ++ ) {

		const distance = planeDistanceToPoint( planes[ i ], center );

		if ( distance < negRadius ) {

			return false;

		}

	}

	return true;

}

/**
 * Returns `true` if the given bounding box is intersecting the frustum.
 *
 * This is a fast, conservative test that favors performance over precision. It can
 * report false positives for large boxes that lie outside the frustum but are not
 * separated by a single frustum plane. It never reports false negatives, so it is
 * safe for culling.
 *
 * @param {FrustumLike} frustum - The frustum to test against.
 * @param {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } }} box - The bounding box to test.
 * @return {boolean} Whether the bounding box is intersecting the frustum or not.
 */
export function frustumIntersectsBox( frustum, box ) {

	const planes = frustum.planes;

	for ( let i = 0; i < 6; i ++ ) {

		const plane = planes[ i ];

		// corner at max distance

		_vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
		_vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
		_vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;

		if ( planeDistanceToPoint( plane, _vector ) < 0 ) {

			return false;

		}

	}

	return true;

}

/**
 * Returns `true` if the given point lies within the frustum.
 *
 * @param {FrustumLike} frustum - The frustum to test against.
 * @param {{ x: number, y: number, z: number }} point - The point to test.
 * @return {boolean} Whether the point lies within the frustum or not.
 */
export function frustumContainsPoint( frustum, point ) {

	const planes = frustum.planes;

	for ( let i = 0; i < 6; i ++ ) {

		if ( planeDistanceToPoint( planes[ i ], point ) < 0 ) {

			return false;

		}

	}

	return true;

}
