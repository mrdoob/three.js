/**
 * A structural type describing any object with `x`, `y`, and `z` numeric
 * components, exactly like {@link Vector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * A structural type describing any object with `x`, `y`, `z`, and `w` numeric
 * components, exactly like {@link Vector4}.
 *
 * @typedef {Object} Vector4Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

/**
 * A structural type describing any object with three corner points `a`, `b`,
 * and `c`, exactly like {@link Triangle}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Triangle} instance. Since {@link Triangle}
 * exposes compatible `a`/`b`/`c` properties, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} TriangleLike
 * @property {Vector3Like} a - The first corner of the triangle.
 * @property {Vector3Like} b - The second corner of the triangle.
 * @property {Vector3Like} c - The third corner of the triangle.
 */

/**
 * A structural type describing any object with a `normal` vector and a
 * `constant`, exactly like {@link Plane}.
 *
 * @typedef {Object} PlaneLike
 * @property {Vector3Like} normal
 * @property {number} constant
 */

/**
 * Creates a new, plain {@link Vector3Like} object at the origin.
 *
 * @return {Vector3Like}
 */
function vec3Create() {

	return { x: 0, y: 0, z: 0 };

}

/**
 * Creates a new, plain {@link Vector4Like} object at the origin.
 *
 * @return {Vector4Like}
 */
function vec4Create() {

	return { x: 0, y: 0, z: 0, w: 0 };

}

/**
 * Creates a new, plain {@link PlaneLike} object matching `new Plane()`.
 *
 * @return {PlaneLike}
 */
function planeCreate() {

	return { normal: { x: 1, y: 0, z: 0 }, constant: 0 };

}

/**
 * Creates a new, plain {@link TriangleLike} object with all corners at the origin.
 *
 * Unlike `new Triangle()`, the returned object is not a class instance and its
 * corners are plain objects - it only satisfies the {@link TriangleLike} shape.
 * This keeps functional-only call sites free of any dependency on the
 * {@link Triangle} class so that unused triangle operations can be tree-shaken.
 *
 * @return {TriangleLike} A new triangle-like object with zeroed corners.
 */
export function triangleCreate() {

	return {
		a: vec3Create(),
		b: vec3Create(),
		c: vec3Create()
	};

}

/**
 * Copies the components of `v` into `target`.
 *
 * @param {Vector3Like} v
 * @param {Vector3Like} target
 * @return {Vector3Like}
 */
function vec3Copy( v, target ) {

	target.x = v.x;
	target.y = v.y;
	target.z = v.z;

	return target;

}

/**
 * Sets `target` to `a - b`.
 *
 * @param {Vector3Like} a
 * @param {Vector3Like} b
 * @param {Vector3Like} target
 * @return {Vector3Like}
 */
function vec3SubVectors( a, b, target ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;
	target.z = a.z - b.z;

	return target;

}

/**
 * Sets `target` to `a × b`.
 *
 * @param {Vector3Like} a
 * @param {Vector3Like} b
 * @param {Vector3Like} target
 * @return {Vector3Like}
 */
function vec3CrossVectors( a, b, target ) {

	const ax = a.x, ay = a.y, az = a.z;
	const bx = b.x, by = b.y, bz = b.z;

	target.x = ay * bz - az * by;
	target.y = az * bx - ax * bz;
	target.z = ax * by - ay * bx;

	return target;

}

/**
 * Sets `target` to `target × v` (in-place cross).
 *
 * @param {Vector3Like} target
 * @param {Vector3Like} v
 * @return {Vector3Like}
 */
function vec3Cross( target, v ) {

	return vec3CrossVectors( target, v, target );

}

/**
 * @param {Vector3Like} a
 * @param {Vector3Like} b
 * @return {number}
 */
function vec3Dot( a, b ) {

	return a.x * b.x + a.y * b.y + a.z * b.z;

}

/**
 * @param {Vector3Like} v
 * @return {number}
 */
function vec3LengthSq( v ) {

	return v.x * v.x + v.y * v.y + v.z * v.z;

}

/**
 * @param {Vector3Like} v
 * @return {number}
 */
function vec3Length( v ) {

	return Math.sqrt( vec3LengthSq( v ) );

}

/**
 * Multiplies `target` by a scalar.
 *
 * @param {Vector3Like} target
 * @param {number} s
 * @return {Vector3Like}
 */
function vec3MultiplyScalar( target, s ) {

	target.x *= s;
	target.y *= s;
	target.z *= s;

	return target;

}

/**
 * Adds `v * s` to `target`.
 *
 * @param {Vector3Like} target
 * @param {Vector3Like} v
 * @param {number} s
 * @return {Vector3Like}
 */
function vec3AddScaledVector( target, v, s ) {

	target.x += v.x * s;
	target.y += v.y * s;
	target.z += v.z * s;

	return target;

}

/**
 * Zeroes a vector-like target, writing only the components it exposes
 * (matching {@link Triangle.getInterpolation}'s dimension handling).
 *
 * @param {Object} target
 */
function clearVectorLike( target ) {

	target.x = 0;
	target.y = 0;
	if ( 'z' in target ) target.z = 0;
	if ( 'w' in target ) target.w = 0;

}

/**
 * Adds `v * s` to a vector-like target, writing only the components it exposes.
 *
 * @param {Object} target
 * @param {Object} v
 * @param {number} s
 */
function addScaledVectorLike( target, v, s ) {

	target.x += v.x * s;
	target.y += v.y * s;
	if ( 'z' in target ) target.z += v.z * s;
	if ( 'w' in target ) target.w += v.w * s;

}

/**
 * Reads a buffer attribute into a Vector4-like scratch.
 *
 * @param {Object} attribute
 * @param {number} index
 * @param {Vector4Like} target
 * @return {Vector4Like}
 */
function fromBufferAttribute4( attribute, index, target ) {

	target.x = attribute.getX( index );
	target.y = attribute.getY( index );
	target.z = attribute.getZ( index );
	target.w = attribute.getW( index );

	return target;

}

/**
 * Reads a buffer attribute into a Vector3-like target.
 *
 * @param {Object} attribute
 * @param {number} index
 * @param {Vector3Like} target
 * @return {Vector3Like}
 */
function fromBufferAttribute3( attribute, index, target ) {

	target.x = attribute.getX( index );
	target.y = attribute.getY( index );
	target.z = attribute.getZ( index );

	return target;

}

/**
 * Computes the normal vector of a triangle.
 *
 * @param {Vector3Like} a - The first corner of the triangle.
 * @param {Vector3Like} b - The second corner of the triangle.
 * @param {Vector3Like} c - The third corner of the triangle.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The triangle's normal.
 */
export function triangleGetNormal( a, b, c, target = vec3Create() ) {

	vec3SubVectors( c, b, target );
	vec3SubVectors( a, b, _v0 );
	vec3Cross( target, _v0 );

	const targetLengthSq = vec3LengthSq( target );
	if ( targetLengthSq > 0 ) {

		return vec3MultiplyScalar( target, 1 / Math.sqrt( targetLengthSq ) );

	}

	target.x = 0;
	target.y = 0;
	target.z = 0;

	return target;

}

/**
 * Computes barycentric coordinates from the given vector.
 * Returns `null` if the triangle is degenerate.
 *
 * @param {Vector3Like} point - A point in 3D space.
 * @param {Vector3Like} a - The first corner of the triangle.
 * @param {Vector3Like} b - The second corner of the triangle.
 * @param {Vector3Like} c - The third corner of the triangle.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {?Vector3Like} The barycentric coordinates for the given point.
 */
export function triangleGetBarycoord( point, a, b, c, target = vec3Create() ) {

	// based on: http://www.blackpawn.com/texts/pointinpoly/default.html

	vec3SubVectors( c, a, _v0 );
	vec3SubVectors( b, a, _v1 );
	vec3SubVectors( point, a, _v2 );

	const dot00 = vec3Dot( _v0, _v0 );
	const dot01 = vec3Dot( _v0, _v1 );
	const dot02 = vec3Dot( _v0, _v2 );
	const dot11 = vec3Dot( _v1, _v1 );
	const dot12 = vec3Dot( _v1, _v2 );

	const denom = ( dot00 * dot11 - dot01 * dot01 );

	// collinear or singular triangle
	if ( denom === 0 ) {

		target.x = 0;
		target.y = 0;
		target.z = 0;
		return null;

	}

	const invDenom = 1 / denom;
	const u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
	const v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

	// barycentric coordinates must always sum to 1
	target.x = 1 - u - v;
	target.y = v;
	target.z = u;

	return target;

}

/**
 * Returns `true` if the given point, when projected onto the plane of the
 * triangle, lies within the triangle.
 *
 * @param {Vector3Like} point - The point in 3D space to test.
 * @param {Vector3Like} a - The first corner of the triangle.
 * @param {Vector3Like} b - The second corner of the triangle.
 * @param {Vector3Like} c - The third corner of the triangle.
 * @return {boolean} Whether the given point, when projected onto the plane of the
 * triangle, lies within the triangle or not.
 */
export function triangleContainsPoint( point, a, b, c ) {

	// if the triangle is degenerate then we can't contain a point
	if ( triangleGetBarycoord( point, a, b, c, _v3 ) === null ) {

		return false;

	}

	return ( _v3.x >= 0 ) && ( _v3.y >= 0 ) && ( ( _v3.x + _v3.y ) <= 1 );

}

/**
 * Computes the value barycentrically interpolated for the given point on the
 * triangle. Returns `null` if the triangle is degenerate.
 *
 * @param {Vector3Like} point - Position of interpolated point.
 * @param {Vector3Like} p1 - The first corner of the triangle.
 * @param {Vector3Like} p2 - The second corner of the triangle.
 * @param {Vector3Like} p3 - The third corner of the triangle.
 * @param {Object} v1 - Value to interpolate of first vertex.
 * @param {Object} v2 - Value to interpolate of second vertex.
 * @param {Object} v3 - Value to interpolate of third vertex.
 * @param {Object} target - The target the result is stored to.
 * @return {?Object} The interpolated value.
 */
export function triangleGetInterpolation( point, p1, p2, p3, v1, v2, v3, target ) {

	if ( triangleGetBarycoord( point, p1, p2, p3, _v3 ) === null ) {

		clearVectorLike( target );
		return null;

	}

	clearVectorLike( target );
	addScaledVectorLike( target, v1, _v3.x );
	addScaledVectorLike( target, v2, _v3.y );
	addScaledVectorLike( target, v3, _v3.z );

	return target;

}

/**
 * Computes the value barycentrically interpolated for the given attribute and indices.
 *
 * @param {Object} attr - The attribute to interpolate.
 * @param {number} i1 - Index of first vertex.
 * @param {number} i2 - Index of second vertex.
 * @param {number} i3 - Index of third vertex.
 * @param {Vector3Like} barycoord - The barycoordinate value to use to interpolate.
 * @param {Object} target - The target the result is stored to.
 * @return {Object} The interpolated attribute value.
 */
export function triangleGetInterpolatedAttribute( attr, i1, i2, i3, barycoord, target ) {

	_v40.x = 0; _v40.y = 0; _v40.z = 0; _v40.w = 0;
	_v41.x = 0; _v41.y = 0; _v41.z = 0; _v41.w = 0;
	_v42.x = 0; _v42.y = 0; _v42.z = 0; _v42.w = 0;

	fromBufferAttribute4( attr, i1, _v40 );
	fromBufferAttribute4( attr, i2, _v41 );
	fromBufferAttribute4( attr, i3, _v42 );

	clearVectorLike( target );
	addScaledVectorLike( target, _v40, barycoord.x );
	addScaledVectorLike( target, _v41, barycoord.y );
	addScaledVectorLike( target, _v42, barycoord.z );

	return target;

}

/**
 * Returns `true` if the triangle is oriented towards the given direction.
 *
 * @param {Vector3Like} a - The first corner of the triangle.
 * @param {Vector3Like} b - The second corner of the triangle.
 * @param {Vector3Like} c - The third corner of the triangle.
 * @param {Vector3Like} direction - The (normalized) direction vector.
 * @return {boolean} Whether the triangle is oriented towards the given direction or not.
 */
export function triangleIsFrontFacing( a, b, c, direction ) {

	vec3SubVectors( c, b, _v0 );
	vec3SubVectors( a, b, _v1 );

	// strictly front facing
	return vec3Dot( vec3Cross( _v0, _v1 ), direction ) < 0;

}

/**
 * Sets the triangle's vertices by copying the given values.
 *
 * @param {Vector3Like} a - The first corner of the triangle.
 * @param {Vector3Like} b - The second corner of the triangle.
 * @param {Vector3Like} c - The third corner of the triangle.
 * @param {TriangleLike} [target] - The target the result is stored to.
 * @return {TriangleLike} The target, for chaining.
 */
export function triangleSet( a, b, c, target = triangleCreate() ) {

	vec3Copy( a, target.a );
	vec3Copy( b, target.b );
	vec3Copy( c, target.c );

	return target;

}

/**
 * Sets the triangle's vertices by copying the given array values.
 *
 * @param {Array<Vector3Like>} points - An array with 3D points.
 * @param {number} i0 - The array index representing the first corner of the triangle.
 * @param {number} i1 - The array index representing the second corner of the triangle.
 * @param {number} i2 - The array index representing the third corner of the triangle.
 * @param {TriangleLike} [target] - The target the result is stored to.
 * @return {TriangleLike} The target, for chaining.
 */
export function triangleSetFromPointsAndIndices( points, i0, i1, i2, target = triangleCreate() ) {

	vec3Copy( points[ i0 ], target.a );
	vec3Copy( points[ i1 ], target.b );
	vec3Copy( points[ i2 ], target.c );

	return target;

}

/**
 * Sets the triangle's vertices by copying the given attribute values.
 *
 * @param {Object} attribute - A buffer attribute with 3D points data.
 * @param {number} i0 - The attribute index representing the first corner of the triangle.
 * @param {number} i1 - The attribute index representing the second corner of the triangle.
 * @param {number} i2 - The attribute index representing the third corner of the triangle.
 * @param {TriangleLike} [target] - The target the result is stored to.
 * @return {TriangleLike} The target, for chaining.
 */
export function triangleSetFromAttributeAndIndices( attribute, i0, i1, i2, target = triangleCreate() ) {

	fromBufferAttribute3( attribute, i0, target.a );
	fromBufferAttribute3( attribute, i1, target.b );
	fromBufferAttribute3( attribute, i2, target.c );

	return target;

}

/**
 * Copies the values of the given triangle into the target.
 *
 * @param {TriangleLike} triangle - The triangle to copy.
 * @param {TriangleLike} [target] - The target the result is stored to.
 * @return {TriangleLike} A copy of `triangle`.
 */
export function triangleCopy( triangle, target = triangleCreate() ) {

	vec3Copy( triangle.a, target.a );
	vec3Copy( triangle.b, target.b );
	vec3Copy( triangle.c, target.c );

	return target;

}

/**
 * Computes the area of the triangle.
 *
 * @param {TriangleLike} triangle - The triangle.
 * @return {number} The triangle's area.
 */
export function triangleGetArea( triangle ) {

	vec3SubVectors( triangle.c, triangle.b, _v0 );
	vec3SubVectors( triangle.a, triangle.b, _v1 );

	return vec3Length( vec3Cross( _v0, _v1 ) ) * 0.5;

}

/**
 * Computes the midpoint of the triangle.
 *
 * @param {TriangleLike} triangle - The triangle.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The triangle's midpoint.
 */
export function triangleGetMidpoint( triangle, target = vec3Create() ) {

	target.x = ( triangle.a.x + triangle.b.x + triangle.c.x ) / 3;
	target.y = ( triangle.a.y + triangle.b.y + triangle.c.y ) / 3;
	target.z = ( triangle.a.z + triangle.b.z + triangle.c.z ) / 3;

	return target;

}

/**
 * Computes a plane the triangle lies within.
 *
 * @param {TriangleLike} triangle - The triangle.
 * @param {PlaneLike} [target] - The target the result is stored to.
 * @return {PlaneLike} The plane the triangle lies within.
 */
export function triangleGetPlane( triangle, target = planeCreate() ) {

	const a = triangle.a;
	const b = triangle.b;
	const c = triangle.c;

	// Plane.setFromCoplanarPoints: normal = normalize( (c-b) × (a-b) ), constant = -dot(normal, a)
	vec3SubVectors( c, b, _v0 );
	vec3SubVectors( a, b, _v1 );
	vec3CrossVectors( _v0, _v1, target.normal );

	const len = vec3Length( target.normal ) || 1;
	target.normal.x /= len;
	target.normal.y /= len;
	target.normal.z /= len;

	target.constant = - vec3Dot( a, target.normal );

	return target;

}

/**
 * Returns `true` if this triangle intersects with the given box.
 *
 * Delegates to the box's `intersectsTriangle` method so the SAT implementation
 * stays in one place (see {@link Box3#intersectsTriangle}).
 *
 * @param {TriangleLike} triangle - The triangle.
 * @param {Object} box - The box to intersect (must implement `intersectsTriangle`).
 * @return {boolean} Whether this triangle intersects with the given box or not.
 */
export function triangleIntersectsBox( triangle, box ) {

	return box.intersectsTriangle( triangle );

}

/**
 * Returns the closest point on the triangle to the given point.
 *
 * @param {TriangleLike} triangle - The triangle.
 * @param {Vector3Like} p - The point to compute the closest point for.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The closest point on the triangle.
 */
export function triangleClosestPointToPoint( triangle, p, target = vec3Create() ) {

	const a = triangle.a, b = triangle.b, c = triangle.c;
	let v, w;

	// algorithm thanks to Real-Time Collision Detection by Christer Ericson,
	// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
	// under the accompanying license; see chapter 5.1.5 for detailed explanation.
	// basically, we're distinguishing which of the voronoi regions of the triangle
	// the point lies in with the minimum amount of redundant computation.

	vec3SubVectors( b, a, _vab );
	vec3SubVectors( c, a, _vac );
	vec3SubVectors( p, a, _vap );
	const d1 = vec3Dot( _vab, _vap );
	const d2 = vec3Dot( _vac, _vap );
	if ( d1 <= 0 && d2 <= 0 ) {

		// vertex region of A; barycentric coords (1, 0, 0)
		return vec3Copy( a, target );

	}

	vec3SubVectors( p, b, _vbp );
	const d3 = vec3Dot( _vab, _vbp );
	const d4 = vec3Dot( _vac, _vbp );
	if ( d3 >= 0 && d4 <= d3 ) {

		// vertex region of B; barycentric coords (0, 1, 0)
		return vec3Copy( b, target );

	}

	const vc = d1 * d4 - d3 * d2;
	if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {

		v = d1 / ( d1 - d3 );
		// edge region of AB; barycentric coords (1-v, v, 0)
		return vec3AddScaledVector( vec3Copy( a, target ), _vab, v );

	}

	vec3SubVectors( p, c, _vcp );
	const d5 = vec3Dot( _vab, _vcp );
	const d6 = vec3Dot( _vac, _vcp );
	if ( d6 >= 0 && d5 <= d6 ) {

		// vertex region of C; barycentric coords (0, 0, 1)
		return vec3Copy( c, target );

	}

	const vb = d5 * d2 - d1 * d6;
	if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {

		w = d2 / ( d2 - d6 );
		// edge region of AC; barycentric coords (1-w, 0, w)
		return vec3AddScaledVector( vec3Copy( a, target ), _vac, w );

	}

	const va = d3 * d6 - d5 * d4;
	if ( va <= 0 && ( d4 - d3 ) >= 0 && ( d5 - d6 ) >= 0 ) {

		vec3SubVectors( c, b, _vbc );
		w = ( d4 - d3 ) / ( ( d4 - d3 ) + ( d5 - d6 ) );
		// edge region of BC; barycentric coords (0, 1-w, w)
		return vec3AddScaledVector( vec3Copy( b, target ), _vbc, w );

	}

	// face region
	const denom = 1 / ( va + vb + vc );
	// u = va * denom
	v = vb * denom;
	w = vc * denom;

	return vec3AddScaledVector( vec3AddScaledVector( vec3Copy( a, target ), _vab, v ), _vac, w );

}

/**
 * Returns `true` if the two triangles are equal.
 *
 * @param {TriangleLike} a - The first triangle.
 * @param {TriangleLike} b - The second triangle.
 * @return {boolean} Whether the triangles are equal.
 */
export function triangleEquals( a, b ) {

	return a.a.x === b.a.x && a.a.y === b.a.y && a.a.z === b.a.z &&
		a.b.x === b.b.x && a.b.y === b.b.y && a.b.z === b.b.z &&
		a.c.x === b.c.x && a.c.y === b.c.y && a.c.z === b.c.z;

}

const _v0 = /*@__PURE__*/ vec3Create();
const _v1 = /*@__PURE__*/ vec3Create();
const _v2 = /*@__PURE__*/ vec3Create();
const _v3 = /*@__PURE__*/ vec3Create();

const _vab = /*@__PURE__*/ vec3Create();
const _vac = /*@__PURE__*/ vec3Create();
const _vbc = /*@__PURE__*/ vec3Create();
const _vap = /*@__PURE__*/ vec3Create();
const _vbp = /*@__PURE__*/ vec3Create();
const _vcp = /*@__PURE__*/ vec3Create();

const _v40 = /*@__PURE__*/ vec4Create();
const _v41 = /*@__PURE__*/ vec4Create();
const _v42 = /*@__PURE__*/ vec4Create();
