import { mat3GetNormalMatrix } from './Matrix3Functions.js';

/**
 * A structural type describing any object with `{ x, y, z }` numeric fields,
 * exactly like {@link Vector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * A structural type describing any object that stores a 3x3 matrix as a
 * column-major list of 9 numbers, exactly like {@link Matrix3#elements}.
 *
 * @typedef {Object} Matrix3Like
 * @property {Array<number>|TypedArray} elements
 */

/**
 * A structural type describing any object that stores a 4x4 matrix as a
 * column-major list of 16 numbers, exactly like {@link Matrix4#elements}.
 *
 * @typedef {Object} Matrix4Like
 * @property {Array<number>|TypedArray} elements
 */

/**
 * A structural type describing a line segment with start and end points.
 *
 * @typedef {Object} Line3Like
 * @property {Vector3Like} start
 * @property {Vector3Like} end
 */

/**
 * A structural type describing an axis-aligned bounding box.
 *
 * @typedef {Object} Box3Like
 * @property {Vector3Like} min
 * @property {Vector3Like} max
 */

/**
 * A structural type describing a sphere.
 *
 * @typedef {Object} SphereLike
 * @property {Vector3Like} center
 * @property {number} radius
 */

/**
 * A structural type describing any object that stores a plane in Hessian
 * normal form, exactly like {@link Plane}: a unit-length normal and a
 * constant.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Plane} instance. Since {@link Plane}
 * exposes compatible `normal` / `constant` fields, instances of that class
 * satisfy this type without any special handling.
 *
 * @typedef {Object} PlaneLike
 * @property {Vector3Like} normal - A unit length vector defining the normal of the plane.
 * @property {number} constant - The signed distance from the origin to the plane.
 */

/**
 * Creates a new, plain {@link PlaneLike} object with a default normal of
 * `(1, 0, 0)` and a constant of `0`.
 *
 * Unlike `new Plane()`, the returned object is not a class instance and
 * carries no `isPlane` flag - it only satisfies the {@link PlaneLike}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Plane} class so that unused plane operations can be tree-shaken.
 *
 * @return {PlaneLike} A new plane-like object.
 */
export function planeCreate() {

	return {

		normal: { x: 1, y: 0, z: 0 },
		constant: 0

	};

}

/**
 * Sets the plane components by copying the given normal and constant into
 * the target.
 *
 * @param {Vector3Like} normal - The normal.
 * @param {number} constant - The constant.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeSet( normal, constant, target = planeCreate() ) {

	target.normal.x = normal.x;
	target.normal.y = normal.y;
	target.normal.z = normal.z;
	target.constant = constant;

	return target;

}

/**
 * Sets the plane components by defining `x`, `y`, `z` as the plane normal
 * and `w` as the constant.
 *
 * @param {number} x - The value for the normal's x component.
 * @param {number} y - The value for the normal's y component.
 * @param {number} z - The value for the normal's z component.
 * @param {number} w - The constant value.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeSetComponents( x, y, z, w, target = planeCreate() ) {

	target.normal.x = x;
	target.normal.y = y;
	target.normal.z = z;
	target.constant = w;

	return target;

}

/**
 * Sets the plane from the given normal and coplanar point (that is a point
 * that lies onto the plane).
 *
 * @param {Vector3Like} normal - The normal.
 * @param {Vector3Like} point - A coplanar point.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeSetFromNormalAndCoplanarPoint( normal, point, target = planeCreate() ) {

	target.normal.x = normal.x;
	target.normal.y = normal.y;
	target.normal.z = normal.z;
	target.constant = - ( point.x * target.normal.x + point.y * target.normal.y + point.z * target.normal.z );

	return target;

}

/**
 * Sets the plane from three coplanar points. The winding order is assumed
 * to be counter-clockwise, and determines the direction of the plane normal.
 *
 * @param {Vector3Like} a - The first coplanar point.
 * @param {Vector3Like} b - The second coplanar point.
 * @param {Vector3Like} c - The third coplanar point.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeSetFromCoplanarPoints( a, b, c, target = planeCreate() ) {

	// normal = normalize( ( c - b ) × ( a - b ) )

	_vector2.x = a.x - b.x;
	_vector2.y = a.y - b.y;
	_vector2.z = a.z - b.z;

	_vector1.x = c.x - b.x;
	_vector1.y = c.y - b.y;
	_vector1.z = c.z - b.z;

	const ax = _vector1.x, ay = _vector1.y, az = _vector1.z;
	_vector1.x = ay * _vector2.z - az * _vector2.y;
	_vector1.y = az * _vector2.x - ax * _vector2.z;
	_vector1.z = ax * _vector2.y - ay * _vector2.x;

	// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

	const len = Math.sqrt( _vector1.x * _vector1.x + _vector1.y * _vector1.y + _vector1.z * _vector1.z );
	_vector1.x /= len;
	_vector1.y /= len;
	_vector1.z /= len;

	return planeSetFromNormalAndCoplanarPoint( _vector1, a, target );

}

/**
 * Copies the values of the given plane into the target.
 *
 * @param {PlaneLike} plane - The plane to copy.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} A copy of `plane`.
 */
export function planeCopy( plane, target = planeCreate() ) {

	target.normal.x = plane.normal.x;
	target.normal.y = plane.normal.y;
	target.normal.z = plane.normal.z;
	target.constant = plane.constant;

	return target;

}

/**
 * Normalizes the plane normal and adjusts the constant accordingly.
 *
 * Note: will lead to a divide by zero if the plane is invalid.
 *
 * @param {PlaneLike} plane - The plane to normalize.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeNormalize( plane, target = planeCreate() ) {

	const nx = plane.normal.x;
	const ny = plane.normal.y;
	const nz = plane.normal.z;
	const inverseNormalLength = 1.0 / Math.sqrt( nx * nx + ny * ny + nz * nz );

	target.normal.x = nx * inverseNormalLength;
	target.normal.y = ny * inverseNormalLength;
	target.normal.z = nz * inverseNormalLength;
	target.constant = plane.constant * inverseNormalLength;

	return target;

}

/**
 * Negates both the plane normal and the constant.
 *
 * @param {PlaneLike} plane - The plane to negate.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeNegate( plane, target = planeCreate() ) {

	target.constant = plane.constant * - 1;
	target.normal.x = - plane.normal.x;
	target.normal.y = - plane.normal.y;
	target.normal.z = - plane.normal.z;

	return target;

}

/**
 * Returns the signed distance from the given point to the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {Vector3Like} point - The point to compute the distance for.
 * @return {number} The signed distance.
 */
export function planeDistanceToPoint( plane, point ) {

	return plane.normal.x * point.x + plane.normal.y * point.y + plane.normal.z * point.z + plane.constant;

}

/**
 * Returns the signed distance from the given sphere to the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {SphereLike} sphere - The sphere to compute the distance for.
 * @return {number} The signed distance.
 */
export function planeDistanceToSphere( plane, sphere ) {

	return planeDistanceToPoint( plane, sphere.center ) - sphere.radius;

}

/**
 * Projects the given point onto the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {Vector3Like} point - The point to project.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The projected point on the plane.
 */
export function planeProjectPoint( plane, point, target = { x: 0, y: 0, z: 0 } ) {

	const distance = planeDistanceToPoint( plane, point );

	target.x = point.x - plane.normal.x * distance;
	target.y = point.y - plane.normal.y * distance;
	target.z = point.z - plane.normal.z * distance;

	return target;

}

/**
 * Returns the intersection point of the passed line and the plane. Returns
 * `null` if the line does not intersect. Returns the line's starting point if
 * the line is coplanar with the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {Line3Like} line - The line to compute the intersection for.
 * @param {Vector3Like} target - The target vector that is used to store the result.
 * @param {boolean} [clampToLine=true] - Whether to clamp the intersection to the line segment.
 * @return {?Vector3Like} The intersection point. Returns `null` if no intersection is detected.
 */
export function planeIntersectLine( plane, line, target, clampToLine = true ) {

	const start = line.start;
	const end = line.end;

	const directionX = end.x - start.x;
	const directionY = end.y - start.y;
	const directionZ = end.z - start.z;

	const denominator = plane.normal.x * directionX + plane.normal.y * directionY + plane.normal.z * directionZ;

	if ( denominator === 0 ) {

		// line is coplanar, return origin
		if ( planeDistanceToPoint( plane, start ) === 0 ) {

			target.x = start.x;
			target.y = start.y;
			target.z = start.z;
			return target;

		}

		// Unsure if this is the correct method to handle this case.
		return null;

	}

	const t = - ( start.x * plane.normal.x + start.y * plane.normal.y + start.z * plane.normal.z + plane.constant ) / denominator;

	if ( ( clampToLine === true ) && ( t < 0 || t > 1 ) ) {

		return null;

	}

	target.x = start.x + directionX * t;
	target.y = start.y + directionY * t;
	target.z = start.z + directionZ * t;

	return target;

}

/**
 * Returns `true` if the given line segment intersects with (passes through)
 * the plane.
 *
 * Note: this tests if a line intersects the plane, not whether it (or its
 * end-points) are coplanar with it.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {Line3Like} line - The line to test.
 * @return {boolean} Whether the given line segment intersects with the plane or not.
 */
export function planeIntersectsLine( plane, line ) {

	const startSign = planeDistanceToPoint( plane, line.start );
	const endSign = planeDistanceToPoint( plane, line.end );

	return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

}

/**
 * Returns `true` if the given bounding box intersects with the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {Box3Like} box - The bounding box to test.
 * @return {boolean} Whether the given bounding box intersects with the plane or not.
 */
export function planeIntersectsBox( plane, box ) {

	// Inlined from Box3.intersectsPlane: compute min/max dot product values.
	// If those values are on the same side of the plane, there is no intersection.

	const normal = plane.normal;
	const minV = box.min;
	const maxV = box.max;

	let min, max;

	if ( normal.x > 0 ) {

		min = normal.x * minV.x;
		max = normal.x * maxV.x;

	} else {

		min = normal.x * maxV.x;
		max = normal.x * minV.x;

	}

	if ( normal.y > 0 ) {

		min += normal.y * minV.y;
		max += normal.y * maxV.y;

	} else {

		min += normal.y * maxV.y;
		max += normal.y * minV.y;

	}

	if ( normal.z > 0 ) {

		min += normal.z * minV.z;
		max += normal.z * maxV.z;

	} else {

		min += normal.z * maxV.z;
		max += normal.z * minV.z;

	}

	return ( min <= - plane.constant && max >= - plane.constant );

}

/**
 * Returns `true` if the given bounding sphere intersects with the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {SphereLike} sphere - The bounding sphere to test.
 * @return {boolean} Whether the given bounding sphere intersects with the plane or not.
 */
export function planeIntersectsSphere( plane, sphere ) {

	return Math.abs( planeDistanceToPoint( plane, sphere.center ) ) <= sphere.radius;

}

/**
 * Returns a coplanar vector to the plane, by calculating the projection of
 * the normal at the origin onto the plane.
 *
 * @param {PlaneLike} plane - The plane.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The coplanar point.
 */
export function planeCoplanarPoint( plane, target = { x: 0, y: 0, z: 0 } ) {

	target.x = plane.normal.x * - plane.constant;
	target.y = plane.normal.y * - plane.constant;
	target.z = plane.normal.z * - plane.constant;

	return target;

}

/**
 * Apply a 4x4 matrix to the plane. The matrix must be an affine, homogeneous
 * transform.
 *
 * The optional normal matrix can be pre-computed like so:
 * ```js
 * const optionalNormalMatrix = mat3GetNormalMatrix( matrix );
 * ```
 *
 * @param {PlaneLike} plane - The plane to transform.
 * @param {Matrix4Like} matrix - The transformation matrix.
 * @param {Matrix3Like} [optionalNormalMatrix] - A pre-computed normal matrix.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeApplyMatrix4( plane, matrix, optionalNormalMatrix, target = planeCreate() ) {

	if ( target !== plane ) {

		planeCopy( plane, target );

	}

	const normalMatrix = optionalNormalMatrix || mat3GetNormalMatrix( matrix, _normalMatrix );

	const referencePoint = planeCoplanarPoint( target, _vector1 );

	// applyMatrix4 (with perspective divide), matching Vector3.applyMatrix4
	{

		const x = referencePoint.x, y = referencePoint.y, z = referencePoint.z;
		const e = matrix.elements;
		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		referencePoint.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		referencePoint.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		referencePoint.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

	}

	const normal = target.normal;

	// applyMatrix3, matching Vector3.applyMatrix3
	{

		const x = normal.x, y = normal.y, z = normal.z;
		const e = normalMatrix.elements;

		normal.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		normal.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		normal.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

	}

	// normalize
	{

		const len = Math.sqrt( normal.x * normal.x + normal.y * normal.y + normal.z * normal.z );
		normal.x /= len;
		normal.y /= len;
		normal.z /= len;

	}

	target.constant = - ( referencePoint.x * normal.x + referencePoint.y * normal.y + referencePoint.z * normal.z );

	return target;

}

/**
 * Translates the plane by the distance defined by the given offset vector.
 * Note that this only affects the plane constant and will not affect the
 * normal vector.
 *
 * @param {PlaneLike} plane - The plane to translate.
 * @param {Vector3Like} offset - The offset vector.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeTranslate( plane, offset, target = planeCreate() ) {

	if ( target !== plane ) {

		target.normal.x = plane.normal.x;
		target.normal.y = plane.normal.y;
		target.normal.z = plane.normal.z;

	}

	target.constant = plane.constant - ( offset.x * plane.normal.x + offset.y * plane.normal.y + offset.z * plane.normal.z );

	return target;

}

/**
 * Returns `true` if the two planes are equal.
 *
 * @param {PlaneLike} a - The first plane.
 * @param {PlaneLike} b - The second plane.
 * @return {boolean} Whether the planes are equal.
 */
export function planeEquals( a, b ) {

	return ( a.normal.x === b.normal.x ) && ( a.normal.y === b.normal.y ) && ( a.normal.z === b.normal.z ) && ( a.constant === b.constant );

}

/**
 * Returns a serialized structure of the plane.
 *
 * @param {PlaneLike} plane - The plane to serialize.
 * @return {Object} Serialized structure with fields representing the object state.
 */
export function planeToJSON( plane ) {

	return {
		normal: [ plane.normal.x, plane.normal.y, plane.normal.z ],
		constant: plane.constant
	};

}

/**
 * Sets the plane properties from the given JSON.
 *
 * @param {Object} json - The serialized json to set the plane from.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The target, for chaining.
 */
export function planeFromJSON( json, target = planeCreate() ) {

	target.normal.x = json.normal[ 0 ];
	target.normal.y = json.normal[ 1 ];
	target.normal.z = json.normal[ 2 ];
	target.constant = json.constant;

	return target;

}

const _vector1 = { x: 0, y: 0, z: 0 };
const _vector2 = { x: 0, y: 0, z: 0 };
const _normalMatrix = { elements: [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] };
