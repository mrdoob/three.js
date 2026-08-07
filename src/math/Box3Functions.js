import {
	vec3Add,
	vec3AddScalar,
	vec3AddVectors,
	vec3ApplyMatrix4,
	vec3Clamp,
	vec3Copy,
	vec3Create,
	vec3CrossVectors,
	vec3DistanceTo,
	vec3DistanceToSquared,
	vec3Equals,
	vec3FromArray,
	vec3FromBufferAttribute,
	vec3Length,
	vec3Max,
	vec3Min,
	vec3MultiplyScalar,
	vec3Set,
	vec3Sub,
	vec3SubVectors,
	vec3ToArray
} from './Vector3Functions.js';

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
 * A structural type describing any object that stores an axis-aligned
 * bounding box as `{ min, max }` vector-likes, exactly like {@link Box3}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Box3} instance. Since {@link Box3} exposes
 * compatible `min` / `max` properties, instances of that class satisfy this
 * type without any special handling.
 *
 * @typedef {Object} Box3Like
 * @property {Vector3Like} min - The lower boundary of the box.
 * @property {Vector3Like} max - The upper boundary of the box.
 */

const _vector = /*@__PURE__*/ vec3Create();
const _box = /*@__PURE__*/ box3CreateEmpty();

/**
 * Creates a new, plain {@link Box3Like} object in the empty default state
 * (min at +Infinity, max at -Infinity).
 *
 * Unlike `new Box3()`, the returned object is not a class instance and
 * carries no `isBox3` flag - it only satisfies the {@link Box3Like} shape.
 * This keeps functional-only call sites free of any dependency on the
 * {@link Box3} class so that unused box operations can be tree-shaken.
 *
 * @return {Box3Like} A new empty box-like object.
 */
export function box3Create() {

	return box3CreateEmpty();

}

function box3CreateEmpty() {

	return {

		min: { x: + Infinity, y: + Infinity, z: + Infinity },
		max: { x: - Infinity, y: - Infinity, z: - Infinity }

	};

}

/**
 * Sets the lower and upper boundaries of the given target.
 * Please note that this function only copies the values from the given objects.
 *
 * @param {Vector3Like} min - The lower boundary of the box.
 * @param {Vector3Like} max - The upper boundary of the box.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3Set( min, max, target = box3Create() ) {

	vec3Copy( min, target.min );
	vec3Copy( max, target.max );

	return target;

}

/**
 * Sets the upper and lower bounds of the given target so it encloses the
 * position data in the given array.
 *
 * @param {Array<number>} array - An array holding 3D position data.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3SetFromArray( array, target = box3Create() ) {

	box3MakeEmpty( target );

	for ( let i = 0, il = array.length; i < il; i += 3 ) {

		box3ExpandByPoint( target, vec3FromArray( array, i, _vector ), target );

	}

	return target;

}

/**
 * Sets the upper and lower bounds of the given target so it encloses the
 * position data in the given buffer attribute.
 *
 * @param {BufferAttribute} attribute - A buffer attribute holding 3D position data.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3SetFromBufferAttribute( attribute, target = box3Create() ) {

	box3MakeEmpty( target );

	for ( let i = 0, il = attribute.count; i < il; i ++ ) {

		box3ExpandByPoint( target, vec3FromBufferAttribute( attribute, i, _vector ), target );

	}

	return target;

}

/**
 * Sets the upper and lower bounds of the given target so it encloses the
 * position data in the given array of points.
 *
 * @param {Array<Vector3Like>} points - An array holding 3D position data.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3SetFromPoints( points, target = box3Create() ) {

	box3MakeEmpty( target );

	for ( let i = 0, il = points.length; i < il; i ++ ) {

		box3ExpandByPoint( target, points[ i ], target );

	}

	return target;

}

/**
 * Centers the given target on the given center vector and sets its width,
 * height and depth to the given size values.
 *
 * @param {Vector3Like} center - The center of the box.
 * @param {Vector3Like} size - The x, y and z dimensions of the box.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3SetFromCenterAndSize( center, size, target = box3Create() ) {

	const halfSize = vec3MultiplyScalar( size, 0.5, _vector );

	vec3Sub( center, halfSize, target.min );
	vec3Add( center, halfSize, target.max );

	return target;

}

/**
 * Computes the world-axis-aligned bounding box for the given 3D object
 * (including its children), accounting for the object's, and children's,
 * world transforms.
 *
 * @param {Object3D} object - The 3D object to compute the bounding box for.
 * @param {boolean} [precise=false] - If set to `true`, computes the smallest
 * world-axis-aligned bounding box at the expense of more computation.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3SetFromObject( object, precise = false, target = box3Create() ) {

	box3MakeEmpty( target );

	return box3ExpandByObject( target, object, precise, target );

}

/**
 * Copies the values of the given box to the target.
 *
 * @param {Box3Like} box - The box to copy.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3Copy( box, target = box3Create() ) {

	vec3Copy( box.min, target.min );
	vec3Copy( box.max, target.max );

	return target;

}

/**
 * Makes the given target empty which means it encloses a zero space in 3D.
 *
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3MakeEmpty( target = box3Create() ) {

	target.min.x = target.min.y = target.min.z = + Infinity;
	target.max.x = target.max.y = target.max.z = - Infinity;

	return target;

}

/**
 * Returns true if the given box includes zero points within its bounds.
 * Note that a box with equal lower and upper bounds still includes one
 * point, the one both bounds share.
 *
 * @param {Box3Like} box - The box to test.
 * @return {boolean} Whether the box is empty or not.
 */
export function box3IsEmpty( box ) {

	// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

	return ( box.max.x < box.min.x ) || ( box.max.y < box.min.y ) || ( box.max.z < box.min.z );

}

/**
 * Returns the center point of the given box.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} [target] - The target vector the result is written to.
 * @return {Vector3Like} The center point.
 */
export function box3GetCenter( box, target = vec3Create() ) {

	return box3IsEmpty( box ) ? vec3Set( target, 0, 0, 0 ) : vec3MultiplyScalar( vec3AddVectors( box.min, box.max, target ), 0.5, target );

}

/**
 * Returns the dimensions of the given box.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} [target] - The target vector the result is written to.
 * @return {Vector3Like} The size.
 */
export function box3GetSize( box, target = vec3Create() ) {

	return box3IsEmpty( box ) ? vec3Set( target, 0, 0, 0 ) : vec3SubVectors( box.max, box.min, target );

}

/**
 * Expands the boundaries of the given box to include the given point.
 *
 * @param {Box3Like} box - The box to expand.
 * @param {Vector3Like} point - The point that should be included.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3ExpandByPoint( box, point, target = box3Create() ) {

	vec3Min( box.min, point, target.min );
	vec3Max( box.max, point, target.max );

	return target;

}

/**
 * Expands the given box equilaterally by the given vector.
 *
 * @param {Box3Like} box - The box to expand.
 * @param {Vector3Like} vector - The vector that should expand the box.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3ExpandByVector( box, vector, target = box3Create() ) {

	vec3Sub( box.min, vector, target.min );
	vec3Add( box.max, vector, target.max );

	return target;

}

/**
 * Expands each dimension of the box by the given scalar. If negative, the
 * dimensions of the box will be contracted.
 *
 * @param {Box3Like} box - The box to expand.
 * @param {number} scalar - The scalar value that should expand the box.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3ExpandByScalar( box, scalar, target = box3Create() ) {

	vec3AddScalar( box.min, - scalar, target.min );
	vec3AddScalar( box.max, scalar, target.max );

	return target;

}

/**
 * Expands the boundaries of the given box to include the given 3D object and
 * its children, accounting for the object's, and children's, world transforms.
 *
 * @param {Box3Like} box - The box to expand.
 * @param {Object3D} object - The 3D object that should expand the box.
 * @param {boolean} [precise=false] - If set to `true`, expands the box as
 * little as necessary at the expense of more computation.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3ExpandByObject( box, object, precise = false, target = box3Create() ) {

	// Computes the world-axis-aligned bounding box of an object (including its children),
	// accounting for both the object's, and children's, world transforms

	if ( target !== box ) box3Copy( box, target );

	object.updateWorldMatrix( false, false );

	const geometry = object.geometry;

	if ( geometry !== undefined ) {

		const positionAttribute = geometry.getAttribute( 'position' );

		// precise AABB computation based on vertex data requires at least a position attribute.
		// instancing isn't supported so far and uses the normal (conservative) code path.

		if ( precise === true && positionAttribute !== undefined && object.isInstancedMesh !== true ) {

			for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {

				if ( object.isMesh === true ) {

					object.getVertexPosition( i, _meshVertex );

				} else {

					vec3FromBufferAttribute( positionAttribute, i, _meshVertex );

				}

				vec3ApplyMatrix4( _meshVertex, object.matrixWorld, _meshVertex );
				box3ExpandByPoint( target, _meshVertex, target );

			}

		} else {

			if ( object.boundingBox !== undefined ) {

				// object-level bounding box

				if ( object.boundingBox === null ) {

					object.computeBoundingBox();

				}

				box3Copy( object.boundingBox, _box );

			} else {

				// geometry-level bounding box

				if ( geometry.boundingBox === null ) {

					geometry.computeBoundingBox();

				}

				box3Copy( geometry.boundingBox, _box );

			}

			box3ApplyMatrix4( _box, object.matrixWorld, _box );

			box3Union( target, _box, target );

		}

	}

	const children = object.children;

	for ( let i = 0, l = children.length; i < l; i ++ ) {

		box3ExpandByObject( target, children[ i ], precise, target );

	}

	return target;

}

/**
 * Returns `true` if the given point lies within or on the boundaries of the box.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} point - The point to test.
 * @return {boolean} Whether the box contains the given point or not.
 */
export function box3ContainsPoint( box, point ) {

	return point.x >= box.min.x && point.x <= box.max.x &&
		point.y >= box.min.y && point.y <= box.max.y &&
		point.z >= box.min.z && point.z <= box.max.z;

}

/**
 * Returns `true` if the given box includes the entirety of the other box.
 * If the two boxes are identical, this function also returns `true`.
 *
 * @param {Box3Like} box - The box.
 * @param {Box3Like} other - The bounding box to test.
 * @return {boolean} Whether the box contains the other box or not.
 */
export function box3ContainsBox( box, other ) {

	return box.min.x <= other.min.x && other.max.x <= box.max.x &&
		box.min.y <= other.min.y && other.max.y <= box.max.y &&
		box.min.z <= other.min.z && other.max.z <= box.max.z;

}

/**
 * Returns a point as a proportion of the box's width, height and depth.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} point - A point in 3D space.
 * @param {Vector3Like} [target] - The target vector the result is written to.
 * @return {Vector3Like} A point as a proportion of the box's width, height and depth.
 */
export function box3GetParameter( box, point, target = vec3Create() ) {

	// This can potentially have a divide by zero if the box
	// has a size dimension of 0.

	return vec3Set(
		target,
		( point.x - box.min.x ) / ( box.max.x - box.min.x ),
		( point.y - box.min.y ) / ( box.max.y - box.min.y ),
		( point.z - box.min.z ) / ( box.max.z - box.min.z )
	);

}

/**
 * Returns `true` if the given bounding box intersects with the box.
 *
 * @param {Box3Like} box - The box.
 * @param {Box3Like} other - The bounding box to test.
 * @return {boolean} Whether the boxes intersect.
 */
export function box3IntersectsBox( box, other ) {

	// using 6 splitting planes to rule out intersections.
	return other.max.x >= box.min.x && other.min.x <= box.max.x &&
		other.max.y >= box.min.y && other.min.y <= box.max.y &&
		other.max.z >= box.min.z && other.min.z <= box.max.z;

}

/**
 * Returns `true` if the given bounding sphere intersects with the box.
 *
 * @param {Box3Like} box - The box.
 * @param {Object} sphere - A sphere-like object with `center` and `radius`.
 * @return {boolean} Whether the sphere intersects with the box.
 */
export function box3IntersectsSphere( box, sphere ) {

	// Find the point on the AABB closest to the sphere center.
	box3ClampPoint( box, sphere.center, _vector );

	// If that point is inside the sphere, the AABB and sphere intersect.
	return vec3DistanceToSquared( _vector, sphere.center ) <= ( sphere.radius * sphere.radius );

}

/**
 * Returns `true` if the given plane intersects with the box.
 *
 * @param {Box3Like} box - The box.
 * @param {Object} plane - A plane-like object with `normal` and `constant`.
 * @return {boolean} Whether the plane intersects with the box.
 */
export function box3IntersectsPlane( box, plane ) {

	// We compute the minimum and maximum dot product values. If those values
	// are on the same side (back or front) of the plane, then there is no intersection.

	let min, max;

	if ( plane.normal.x > 0 ) {

		min = plane.normal.x * box.min.x;
		max = plane.normal.x * box.max.x;

	} else {

		min = plane.normal.x * box.max.x;
		max = plane.normal.x * box.min.x;

	}

	if ( plane.normal.y > 0 ) {

		min += plane.normal.y * box.min.y;
		max += plane.normal.y * box.max.y;

	} else {

		min += plane.normal.y * box.max.y;
		max += plane.normal.y * box.min.y;

	}

	if ( plane.normal.z > 0 ) {

		min += plane.normal.z * box.min.z;
		max += plane.normal.z * box.max.z;

	} else {

		min += plane.normal.z * box.max.z;
		max += plane.normal.z * box.min.z;

	}

	return ( min <= - plane.constant && max >= - plane.constant );

}

/**
 * Returns `true` if the given triangle intersects with the box.
 *
 * @param {Box3Like} box - The box.
 * @param {Object} triangle - A triangle-like object with `a`, `b`, `c` vertices.
 * @return {boolean} Whether the triangle intersects with the box.
 */
export function box3IntersectsTriangle( box, triangle ) {

	if ( box3IsEmpty( box ) ) {

		return false;

	}

	// compute box center and extents
	box3GetCenter( box, _center );
	vec3SubVectors( box.max, _center, _extents );

	// translate triangle to aabb origin
	vec3SubVectors( triangle.a, _center, _v0 );
	vec3SubVectors( triangle.b, _center, _v1 );
	vec3SubVectors( triangle.c, _center, _v2 );

	// compute edge vectors for triangle
	vec3SubVectors( _v1, _v0, _f0 );
	vec3SubVectors( _v2, _v1, _f1 );
	vec3SubVectors( _v0, _v2, _f2 );

	// test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
	// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
	// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
	let axes = [
		0, - _f0.z, _f0.y, 0, - _f1.z, _f1.y, 0, - _f2.z, _f2.y,
		_f0.z, 0, - _f0.x, _f1.z, 0, - _f1.x, _f2.z, 0, - _f2.x,
		- _f0.y, _f0.x, 0, - _f1.y, _f1.x, 0, - _f2.y, _f2.x, 0
	];
	if ( ! satForAxes( axes, _v0, _v1, _v2, _extents ) ) {

		return false;

	}

	// test 3 face normals from the aabb
	axes = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
	if ( ! satForAxes( axes, _v0, _v1, _v2, _extents ) ) {

		return false;

	}

	// finally testing the face normal of the triangle
	// use already existing triangle edge vectors here
	vec3CrossVectors( _f0, _f1, _triangleNormal );
	axes = [ _triangleNormal.x, _triangleNormal.y, _triangleNormal.z ];

	return satForAxes( axes, _v0, _v1, _v2, _extents );

}

/**
 * Clamps the given point within the bounds of the box.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} point - The point to clamp.
 * @param {Vector3Like} [target] - The target vector the result is written to.
 * @return {Vector3Like} The clamped point.
 */
export function box3ClampPoint( box, point, target = vec3Create() ) {

	return vec3Clamp( point, box.min, box.max, target );

}

/**
 * Returns the euclidean distance from any edge of the box to the specified
 * point. If the given point lies inside the box, the distance will be `0`.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} point - The point to compute the distance to.
 * @return {number} The euclidean distance.
 */
export function box3DistanceToPoint( box, point ) {

	return vec3DistanceTo( box3ClampPoint( box, point, _vector ), point );

}

/**
 * Returns a bounding sphere that encloses the given box.
 *
 * @param {Box3Like} box - The box.
 * @param {Object} [target] - A sphere-like object with `center` and `radius`.
 * @return {Object} The bounding sphere that encloses the box.
 */
export function box3GetBoundingSphere( box, target = { center: vec3Create(), radius: - 1 } ) {

	if ( box3IsEmpty( box ) ) {

		vec3Set( target.center, 0, 0, 0 );
		target.radius = - 1;

	} else {

		box3GetCenter( box, target.center );

		target.radius = vec3Length( box3GetSize( box, _vector ) ) * 0.5;

	}

	return target;

}

/**
 * Computes the intersection of the given box and another, setting the upper
 * bound to the lesser of the two boxes' upper bounds and the lower bound to
 * the greater of the two boxes' lower bounds. If there's no overlap, makes
 * the result empty.
 *
 * @param {Box3Like} box - The box.
 * @param {Box3Like} other - The bounding box to intersect with.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3Intersect( box, other, target = box3Create() ) {

	vec3Max( box.min, other.min, target.min );
	vec3Min( box.max, other.max, target.max );

	// ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
	if ( box3IsEmpty( target ) ) box3MakeEmpty( target );

	return target;

}

/**
 * Computes the union of the given box and another, setting the upper bound
 * to the greater of the two boxes' upper bounds and the lower bound to the
 * lesser of the two boxes' lower bounds.
 *
 * @param {Box3Like} box - The box.
 * @param {Box3Like} other - The bounding box that will be unioned.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3Union( box, other, target = box3Create() ) {

	vec3Min( box.min, other.min, target.min );
	vec3Max( box.max, other.max, target.max );

	return target;

}

/**
 * Transforms the given bounding box by the given 4x4 transformation matrix.
 *
 * @param {Box3Like} box - The box.
 * @param {Object} matrix - A matrix-like object with an `elements` array.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3ApplyMatrix4( box, matrix, target = box3Create() ) {

	// transform of empty box is an empty box.
	if ( box3IsEmpty( box ) ) {

		if ( target !== box ) box3Copy( box, target );
		return target;

	}

	const minX = box.min.x, minY = box.min.y, minZ = box.min.z;
	const maxX = box.max.x, maxY = box.max.y, maxZ = box.max.z;

	// NOTE: I am using a binary pattern to specify all 2^3 combinations below
	vec3ApplyMatrix4( vec3Set( _points[ 0 ], minX, minY, minZ ), matrix, _points[ 0 ] ); // 000
	vec3ApplyMatrix4( vec3Set( _points[ 1 ], minX, minY, maxZ ), matrix, _points[ 1 ] ); // 001
	vec3ApplyMatrix4( vec3Set( _points[ 2 ], minX, maxY, minZ ), matrix, _points[ 2 ] ); // 010
	vec3ApplyMatrix4( vec3Set( _points[ 3 ], minX, maxY, maxZ ), matrix, _points[ 3 ] ); // 011
	vec3ApplyMatrix4( vec3Set( _points[ 4 ], maxX, minY, minZ ), matrix, _points[ 4 ] ); // 100
	vec3ApplyMatrix4( vec3Set( _points[ 5 ], maxX, minY, maxZ ), matrix, _points[ 5 ] ); // 101
	vec3ApplyMatrix4( vec3Set( _points[ 6 ], maxX, maxY, minZ ), matrix, _points[ 6 ] ); // 110
	vec3ApplyMatrix4( vec3Set( _points[ 7 ], maxX, maxY, maxZ ), matrix, _points[ 7 ] ); // 111

	return box3SetFromPoints( _points, target );

}

/**
 * Adds the given offset to both the upper and lower bounds of the box,
 * effectively moving it in 3D space.
 *
 * @param {Box3Like} box - The box.
 * @param {Vector3Like} offset - The offset that should be used to translate the box.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3Translate( box, offset, target = box3Create() ) {

	vec3Add( box.min, offset, target.min );
	vec3Add( box.max, offset, target.max );

	return target;

}

/**
 * Returns `true` if the two bounding boxes are equal.
 *
 * @param {Box3Like} a - The first box.
 * @param {Box3Like} b - The second box.
 * @return {boolean} Whether the boxes are equal.
 */
export function box3Equals( a, b ) {

	return vec3Equals( a.min, b.min ) && vec3Equals( a.max, b.max );

}

/**
 * Returns a serialized structure of the bounding box.
 *
 * @param {Box3Like} box - The box.
 * @return {Object} Serialized structure with fields representing the object state.
 */
export function box3ToJSON( box ) {

	return {
		min: vec3ToArray( box.min ),
		max: vec3ToArray( box.max )
	};

}

/**
 * Sets the given target from a serialized structure of the bounding box.
 *
 * @param {Object} json - The serialized json to set the box from.
 * @param {Box3Like} [target] - The target the result is written to.
 * @return {Box3Like} The target.
 */
export function box3FromJSON( json, target = box3Create() ) {

	vec3FromArray( json.min, 0, target.min );
	vec3FromArray( json.max, 0, target.max );

	return target;

}

// ----------------------------------------------------------------------------
// Module-level scratches (zero per-call allocation), plain objects only.
// ----------------------------------------------------------------------------

const _points = [
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create(),
	/*@__PURE__*/ vec3Create()
];

// Duck-typed vector scratch for Mesh.getVertexPosition / SkinnedMesh.applyBoneTransform,
// which expect Vector3-like methods (fromBufferAttribute, add, set, addScaledVector,
// and Symbol.iterator for the `...target` spread in applyBoneTransform).
const _meshVertex = {
	x: 0, y: 0, z: 0,
	set( x, y, z ) {

		this.x = x; this.y = y; this.z = z;
		return this;

	},
	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );
		return this;

	},
	add( v ) {

		this.x += v.x; this.y += v.y; this.z += v.z;
		return this;

	},
	addScaledVector( v, s ) {

		this.x += v.x * s; this.y += v.y * s; this.z += v.z * s;
		return this;

	},
	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}
};

// triangle centered vertices

const _v0 = /*@__PURE__*/ vec3Create();
const _v1 = /*@__PURE__*/ vec3Create();
const _v2 = /*@__PURE__*/ vec3Create();

// triangle edge vectors

const _f0 = /*@__PURE__*/ vec3Create();
const _f1 = /*@__PURE__*/ vec3Create();
const _f2 = /*@__PURE__*/ vec3Create();

const _center = /*@__PURE__*/ vec3Create();
const _extents = /*@__PURE__*/ vec3Create();
const _triangleNormal = /*@__PURE__*/ vec3Create();
const _testAxis = /*@__PURE__*/ vec3Create();

function satForAxes( axes, v0, v1, v2, extents ) {

	for ( let i = 0, j = axes.length - 3; i <= j; i += 3 ) {

		vec3FromArray( axes, i, _testAxis );
		// project the aabb onto the separating axis
		const r = extents.x * Math.abs( _testAxis.x ) + extents.y * Math.abs( _testAxis.y ) + extents.z * Math.abs( _testAxis.z );
		// project all 3 vertices of the triangle onto the separating axis
		const p0 = v0.x * _testAxis.x + v0.y * _testAxis.y + v0.z * _testAxis.z;
		const p1 = v1.x * _testAxis.x + v1.y * _testAxis.y + v1.z * _testAxis.z;
		const p2 = v2.x * _testAxis.x + v2.y * _testAxis.y + v2.z * _testAxis.z;
		// actual test, basically see if either of the most extreme of the triangle points intersects r
		if ( Math.max( - Math.max( p0, p1, p2 ), Math.min( p0, p1, p2 ) ) > r ) {

			// points of the projected triangle are outside the projected half-length of the aabb
			// the axis is separating and we can exit
			return false;

		}

	}

	return true;

}
