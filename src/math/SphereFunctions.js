import {
	box3Create,
	box3ExpandByScalar,
	box3GetCenter,
	box3IntersectsSphere,
	box3MakeEmpty,
	box3Set,
	box3SetFromPoints
} from './Box3Functions.js';
import { mat4GetMaxScaleOnAxis } from './Matrix4Functions.js';

/**
 * A structural type describing any object with `{ x, y, z }` numeric
 * components, exactly like {@link Vector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * A structural type describing any object with `{ min, max }` bounds,
 * exactly like {@link Box3}.
 *
 * @typedef {Object} Box3Like
 * @property {Vector3Like} min
 * @property {Vector3Like} max
 */

/**
 * A structural type describing any object with a normal and constant,
 * exactly like {@link Plane}.
 *
 * @typedef {Object} PlaneLike
 * @property {Vector3Like} normal
 * @property {number} constant
 */

/**
 * A structural type describing any object that stores a sphere as a
 * center point and radius, exactly like {@link Sphere}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Sphere} instance. Since {@link Sphere}
 * exposes compatible `center` and `radius` fields, instances of that class
 * satisfy this type without any special handling.
 *
 * @typedef {Object} SphereLike
 * @property {Vector3Like} center - The center of the sphere.
 * @property {number} radius - The radius of the sphere.
 */

/**
 * Creates a new, plain {@link SphereLike} object with center at the origin
 * and radius `-1` (empty), matching `new Sphere()`.
 *
 * Unlike `new Sphere()`, the returned object is not a class instance and
 * carries no `isSphere` flag - it only satisfies the {@link SphereLike}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Sphere} class so that unused sphere operations can be tree-shaken.
 *
 * @return {SphereLike} A new sphere-like object in the empty default state.
 */
export function sphereCreate() {

	return {

		center: { x: 0, y: 0, z: 0 },
		radius: - 1

	};

}

/**
 * Sets the sphere's components by copying the given values.
 *
 * @param {Vector3Like} center - The center.
 * @param {number} radius - The radius.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereSet( center, radius, target = sphereCreate() ) {

	target.center.x = center.x;
	target.center.y = center.y;
	target.center.z = center.z;
	target.radius = radius;

	return target;

}

/**
 * Computes the minimum bounding sphere for a list of points.
 * If the optional center point is given, it is used as the sphere's
 * center. Otherwise, the center of the axis-aligned bounding box
 * encompassing the points is calculated.
 *
 * @param {Array<Vector3Like>} points - A list of points in 3D space.
 * @param {Vector3Like} [optionalCenter] - The center of the sphere.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereSetFromPoints( points, optionalCenter, target = sphereCreate() ) {

	const center = target.center;

	if ( optionalCenter !== undefined ) {

		center.x = optionalCenter.x;
		center.y = optionalCenter.y;
		center.z = optionalCenter.z;

	} else {

		box3SetFromPoints( points, _box );
		box3GetCenter( _box, center );

	}

	let maxRadiusSq = 0;

	for ( let i = 0, il = points.length; i < il; i ++ ) {

		const p = points[ i ];
		const dx = center.x - p.x;
		const dy = center.y - p.y;
		const dz = center.z - p.z;
		maxRadiusSq = Math.max( maxRadiusSq, dx * dx + dy * dy + dz * dz );

	}

	target.radius = Math.sqrt( maxRadiusSq );

	return target;

}

/**
 * Copies the values of the given sphere into the target.
 *
 * @param {SphereLike} sphere - The sphere to copy.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} A copy of `sphere`.
 */
export function sphereCopy( sphere, target = sphereCreate() ) {

	target.center.x = sphere.center.x;
	target.center.y = sphere.center.y;
	target.center.z = sphere.center.z;
	target.radius = sphere.radius;

	return target;

}

/**
 * Returns `true` if the sphere is empty (the radius set to a negative number).
 *
 * Spheres with a radius of `0` contain only their center point and are not
 * considered to be empty.
 *
 * @param {SphereLike} sphere - The sphere to test.
 * @return {boolean} Whether the sphere is empty or not.
 */
export function sphereIsEmpty( sphere ) {

	return ( sphere.radius < 0 );

}

/**
 * Makes the target sphere empty which means it encloses a zero space in 3D.
 *
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereMakeEmpty( target = sphereCreate() ) {

	target.center.x = 0;
	target.center.y = 0;
	target.center.z = 0;
	target.radius = - 1;

	return target;

}

/**
 * Returns `true` if the sphere contains the given point inclusive of
 * the surface of the sphere.
 *
 * @param {SphereLike} sphere - The sphere.
 * @param {Vector3Like} point - The point to check.
 * @return {boolean} Whether the sphere contains the given point or not.
 */
export function sphereContainsPoint( sphere, point ) {

	const dx = point.x - sphere.center.x;
	const dy = point.y - sphere.center.y;
	const dz = point.z - sphere.center.z;

	return ( dx * dx + dy * dy + dz * dz ) <= ( sphere.radius * sphere.radius );

}

/**
 * Returns the closest distance from the boundary of the sphere to the
 * given point. If the sphere contains the point, the distance will
 * be negative.
 *
 * @param {SphereLike} sphere - The sphere.
 * @param {Vector3Like} point - The point to compute the distance to.
 * @return {number} The distance to the point.
 */
export function sphereDistanceToPoint( sphere, point ) {

	const dx = point.x - sphere.center.x;
	const dy = point.y - sphere.center.y;
	const dz = point.z - sphere.center.z;

	return Math.sqrt( dx * dx + dy * dy + dz * dz ) - sphere.radius;

}

/**
 * Returns `true` if the two spheres intersect.
 *
 * @param {SphereLike} a - The first sphere.
 * @param {SphereLike} b - The second sphere.
 * @return {boolean} Whether the spheres intersect or not.
 */
export function sphereIntersectsSphere( a, b ) {

	const radiusSum = a.radius + b.radius;
	const dx = b.center.x - a.center.x;
	const dy = b.center.y - a.center.y;
	const dz = b.center.z - a.center.z;

	return ( dx * dx + dy * dy + dz * dz ) <= ( radiusSum * radiusSum );

}

/**
 * Returns `true` if the sphere intersects with the given box.
 *
 * @param {SphereLike} sphere - The sphere.
 * @param {Box3Like} box - The box to test.
 * @return {boolean} Whether the sphere intersects with the given box or not.
 */
export function sphereIntersectsBox( sphere, box ) {

	return box3IntersectsSphere( box, sphere );

}

/**
 * Returns `true` if the sphere intersects with the given plane.
 *
 * @param {SphereLike} sphere - The sphere.
 * @param {PlaneLike} plane - The plane to test.
 * @return {boolean} Whether the sphere intersects with the given plane or not.
 */
export function sphereIntersectsPlane( sphere, plane ) {

	const distance = plane.normal.x * sphere.center.x +
		plane.normal.y * sphere.center.y +
		plane.normal.z * sphere.center.z +
		plane.constant;

	return Math.abs( distance ) <= sphere.radius;

}

/**
 * Clamps a point within the sphere. If the point is outside the sphere, it
 * will clamp it to the closest point on the edge of the sphere. Points
 * already inside the sphere will not be affected.
 *
 * @param {SphereLike} sphere - The sphere.
 * @param {Vector3Like} point - The point to clamp.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The clamped point.
 */
export function sphereClampPoint( sphere, point, target = { x: 0, y: 0, z: 0 } ) {

	const dx = point.x - sphere.center.x;
	const dy = point.y - sphere.center.y;
	const dz = point.z - sphere.center.z;
	const deltaLengthSq = dx * dx + dy * dy + dz * dz;

	target.x = point.x;
	target.y = point.y;
	target.z = point.z;

	if ( deltaLengthSq > ( sphere.radius * sphere.radius ) ) {

		const length = Math.sqrt( deltaLengthSq ) || 1;
		const invLength = 1 / length;

		target.x = sphere.center.x + dx * invLength * sphere.radius;
		target.y = sphere.center.y + dy * invLength * sphere.radius;
		target.z = sphere.center.z + dz * invLength * sphere.radius;

	}

	return target;

}

/**
 * Returns a bounding box that encloses the sphere.
 *
 * @param {SphereLike} sphere - The sphere.
 * @param {Box3Like} [target] - The target box that is used to store the result.
 * @return {Box3Like} The bounding box that encloses the sphere.
 */
export function sphereGetBoundingBox( sphere, target = box3Create() ) {

	if ( sphereIsEmpty( sphere ) ) {

		// Empty sphere produces empty bounding box
		return box3MakeEmpty( target );

	}

	box3Set( sphere.center, sphere.center, target );
	return box3ExpandByScalar( target, sphere.radius, target );

}

/**
 * Transforms the sphere with the given 4x4 transformation matrix.
 *
 * @param {SphereLike} sphere - The sphere to transform.
 * @param {import('./Matrix4Functions.js').Matrix4Like} matrix - The transformation matrix.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereApplyMatrix4( sphere, matrix, target = sphereCreate() ) {

	const center = sphere.center;
	const x = center.x, y = center.y, z = center.z;
	const e = matrix.elements;

	const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

	target.center.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
	target.center.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
	target.center.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
	target.radius = sphere.radius * mat4GetMaxScaleOnAxis( matrix );

	return target;

}

/**
 * Translates the sphere's center by the given offset.
 *
 * @param {SphereLike} sphere - The sphere to translate.
 * @param {Vector3Like} offset - The offset.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereTranslate( sphere, offset, target = sphereCreate() ) {

	target.center.x = sphere.center.x + offset.x;
	target.center.y = sphere.center.y + offset.y;
	target.center.z = sphere.center.z + offset.z;
	target.radius = sphere.radius;

	return target;

}

/**
 * Expands the boundaries of the sphere to include the given point.
 *
 * @param {SphereLike} sphere - The sphere to expand.
 * @param {Vector3Like} point - The point to include.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereExpandByPoint( sphere, point, target = sphereCreate() ) {

	if ( target !== sphere ) {

		sphereCopy( sphere, target );

	}

	if ( sphereIsEmpty( target ) ) {

		target.center.x = point.x;
		target.center.y = point.y;
		target.center.z = point.z;
		target.radius = 0;

		return target;

	}

	const vx = point.x - target.center.x;
	const vy = point.y - target.center.y;
	const vz = point.z - target.center.z;

	const lengthSq = vx * vx + vy * vy + vz * vz;

	if ( lengthSq > ( target.radius * target.radius ) ) {

		// calculate the minimal sphere

		const length = Math.sqrt( lengthSq );

		const delta = ( length - target.radius ) * 0.5;

		const scale = delta / length;

		target.center.x += vx * scale;
		target.center.y += vy * scale;
		target.center.z += vz * scale;

		target.radius += delta;

	}

	return target;

}

/**
 * Expands the sphere to enclose both the original sphere and the given sphere.
 *
 * @param {SphereLike} sphere - The first sphere.
 * @param {SphereLike} other - The sphere to include.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereUnion( sphere, other, target = sphereCreate() ) {

	if ( sphereIsEmpty( other ) ) {

		if ( target !== sphere ) sphereCopy( sphere, target );
		return target;

	}

	if ( sphereIsEmpty( sphere ) ) {

		return sphereCopy( other, target );

	}

	if ( target !== sphere ) {

		sphereCopy( sphere, target );

	}

	if ( target.center.x === other.center.x &&
		target.center.y === other.center.y &&
		target.center.z === other.center.z ) {

		target.radius = Math.max( target.radius, other.radius );

	} else {

		_v2.x = other.center.x - target.center.x;
		_v2.y = other.center.y - target.center.y;
		_v2.z = other.center.z - target.center.z;

		// setLength( other.radius )
		const lenSq = _v2.x * _v2.x + _v2.y * _v2.y + _v2.z * _v2.z;
		const len = Math.sqrt( lenSq ) || 1;
		const invLen = other.radius / len;
		_v2.x *= invLen;
		_v2.y *= invLen;
		_v2.z *= invLen;

		_v1.x = other.center.x + _v2.x;
		_v1.y = other.center.y + _v2.y;
		_v1.z = other.center.z + _v2.z;
		sphereExpandByPoint( target, _v1, target );

		_v1.x = other.center.x - _v2.x;
		_v1.y = other.center.y - _v2.y;
		_v1.z = other.center.z - _v2.z;
		sphereExpandByPoint( target, _v1, target );

	}

	return target;

}

/**
 * Returns `true` if the two spheres are equal.
 *
 * @param {SphereLike} a - The first sphere.
 * @param {SphereLike} b - The second sphere.
 * @return {boolean} Whether the spheres are equal.
 */
export function sphereEquals( a, b ) {

	return ( a.center.x === b.center.x ) &&
		( a.center.y === b.center.y ) &&
		( a.center.z === b.center.z ) &&
		( a.radius === b.radius );

}

/**
 * Returns a serialized structure of the bounding sphere.
 *
 * @param {SphereLike} sphere - The sphere to serialize.
 * @return {Object} Serialized structure with fields representing the object state.
 */
export function sphereToJSON( sphere ) {

	return {
		radius: sphere.radius,
		center: [ sphere.center.x, sphere.center.y, sphere.center.z ]
	};

}

/**
 * Sets the sphere from a serialized structure.
 *
 * @param {Object} json - The serialized json to set the sphere from.
 * @param {SphereLike} [target] - The target the result is stored to.
 * @return {SphereLike} The target, for chaining.
 */
export function sphereFromJSON( json, target = sphereCreate() ) {

	target.radius = json.radius;
	target.center.x = json.center[ 0 ];
	target.center.y = json.center[ 1 ];
	target.center.z = json.center[ 2 ];

	return target;

}

const _box = /*@__PURE__*/ box3Create();
const _v1 = { x: 0, y: 0, z: 0 };
const _v2 = { x: 0, y: 0, z: 0 };
