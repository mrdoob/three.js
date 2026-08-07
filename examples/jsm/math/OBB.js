import {
	MathUtils,
	Matrix3,
	Vector3,
	box3Create,
	box3GetCenter,
	box3GetSize,
	box3SetFromCenterAndSize,
	mat3Copy,
	mat3Create,
	mat3Equals,
	mat3ExtractBasis,
	mat3Identity,
	mat3Multiply,
	mat3SetFromMatrix4,
	mat4Copy,
	mat4Create,
	mat4Determinant,
	mat4Invert,
	mat4SetFromMatrix3,
	mat4SetPosition,
	rayApplyMatrix4,
	rayCopy,
	rayCreate,
	rayIntersectBox,
	vec3Add,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3DistanceToSquared,
	vec3Dot,
	vec3Equals,
	vec3Length,
	vec3MultiplyScalar,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3SubVectors
} from 'three';

// module scope helper variables

const a = {
	c: null, // center
	u: [ /*@__PURE__*/ vec3Create(), /*@__PURE__*/ vec3Create(), /*@__PURE__*/ vec3Create() ], // basis vectors
	e: [] // half width
};

const b = {
	c: null, // center
	u: [ /*@__PURE__*/ vec3Create(), /*@__PURE__*/ vec3Create(), /*@__PURE__*/ vec3Create() ], // basis vectors
	e: [] // half width
};

const R = [[], [], []];
const AbsR = [[], [], []];
const t = [];

const xAxis = /*@__PURE__*/ vec3Create();
const yAxis = /*@__PURE__*/ vec3Create();
const zAxis = /*@__PURE__*/ vec3Create();
const v1 = /*@__PURE__*/ vec3Create();
const size = /*@__PURE__*/ vec3Create();
const closestPoint = /*@__PURE__*/ vec3Create();
const rotationMatrix = /*@__PURE__*/ mat3Create();
const aabb = /*@__PURE__*/ box3Create();
const matrix = /*@__PURE__*/ mat4Create();
const inverse = /*@__PURE__*/ mat4Create();
const localRay = /*@__PURE__*/ rayCreate();

/**
 * Represents an oriented bounding box (OBB) in 3D space.
 *
 * @three_import import { OBB } from 'three/addons/math/OBB.js';
 */
class OBB {

	/**
	 * Constructs a new OBB.
	 *
	 * @param {Vector3} [center] - The center of the OBB.
	 * @param {Vector3} [halfSize] - Positive halfwidth extents of the OBB along each axis.
	 * @param {Matrix3} [rotation] - The rotation of the OBB.
	 */
	constructor( center = new Vector3(), halfSize = new Vector3(), rotation = new Matrix3() ) {

		/**
		 * The center of the OBB.
		 *
		 * @type {Vector3}
		 */
		this.center = center;

		/**
		 * Positive halfwidth extents of the OBB along each axis.
		 *
		 * @type {Vector3}
		 */
		this.halfSize = halfSize;

		/**
		 * The rotation of the OBB.
		 *
		 * @type {Matrix3}
		 */
		this.rotation = rotation;

	}

	/**
	 * Sets the OBBs components to the given values.
	 *
	 * @param {Vector3} [center] - The center of the OBB.
	 * @param {Vector3} [halfSize] - Positive halfwidth extents of the OBB along each axis.
	 * @param {Matrix3} [rotation] - The rotation of the OBB.
	 * @return {OBB} A reference to this OBB.
	 */
	set( center, halfSize, rotation ) {

		this.center = center;
		this.halfSize = halfSize;
		this.rotation = rotation;

		return this;

	}

	/**
	 * Copies the values of the given OBB to this instance.
	 *
	 * @param {OBB} obb - The OBB to copy.
	 * @return {OBB} A reference to this OBB.
	 */
	copy( obb ) {

		vec3Copy( obb.center, this.center );
		vec3Copy( obb.halfSize, this.halfSize );
		mat3Copy( obb.rotation, this.rotation );

		return this;

	}

	/**
	 * Returns a new OBB with copied values from this instance.
	 *
	 * @return {OBB} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Returns the size of this OBB.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The size.
	 */
	getSize( target ) {

		return vec3MultiplyScalar( this.halfSize, 2, target );

	}

	/**
	 * Clamps the given point within the bounds of this OBB.
	 *
	 * @param {Vector3} point - The point that should be clamped within the bounds of this OBB.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @returns {Vector3} - The clamped point.
	 */
	clampPoint( point, target ) {

		// Reference: Closest Point on OBB to Point in Real-Time Collision Detection
		// by Christer Ericson (chapter 5.1.4)

		const halfSize = this.halfSize;

		vec3SubVectors( point, this.center, v1 );
		mat3ExtractBasis( this.rotation, xAxis, yAxis, zAxis );

		// start at the center position of the OBB

		vec3Copy( this.center, target );

		// project the target onto the OBB axes and walk towards that point

		const x = MathUtils.clamp( vec3Dot( v1, xAxis ), - halfSize.x, halfSize.x );
		vec3MultiplyScalar( xAxis, x, xAxis );
		vec3Add( target, xAxis, target );

		const y = MathUtils.clamp( vec3Dot( v1, yAxis ), - halfSize.y, halfSize.y );
		vec3MultiplyScalar( yAxis, y, yAxis );
		vec3Add( target, yAxis, target );

		const z = MathUtils.clamp( vec3Dot( v1, zAxis ), - halfSize.z, halfSize.z );
		vec3MultiplyScalar( zAxis, z, zAxis );
		vec3Add( target, zAxis, target );

		return target;

	}

	/**
	 * Returns `true` if the given point lies within this OBB.
	 *
	 * @param {Vector3} point - The point to test.
	 * @returns {boolean} - Whether the given point lies within this OBB or not.
	 */
	containsPoint( point ) {

		vec3SubVectors( point, this.center, v1 );
		mat3ExtractBasis( this.rotation, xAxis, yAxis, zAxis );

		// project v1 onto each axis and check if these points lie inside the OBB

		return Math.abs( vec3Dot( v1, xAxis ) ) <= this.halfSize.x &&
				Math.abs( vec3Dot( v1, yAxis ) ) <= this.halfSize.y &&
				Math.abs( vec3Dot( v1, zAxis ) ) <= this.halfSize.z;

	}

	/**
	 * Returns `true` if the given AABB intersects this OBB.
	 *
	 * @param {Box3} box3 - The AABB to test.
	 * @returns {boolean} - Whether the given AABB intersects this OBB or not.
	 */
	intersectsBox3( box3 ) {

		return this.intersectsOBB( obb.fromBox3( box3 ) );

	}

	/**
	 * Returns `true` if the given bounding sphere intersects this OBB.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @returns {boolean} - Whether the given bounding sphere intersects this OBB or not.
	 */
	intersectsSphere( sphere ) {

		// find the point on the OBB closest to the sphere center

		this.clampPoint( sphere.center, closestPoint );

		// if that point is inside the sphere, the OBB and sphere intersect

		return vec3DistanceToSquared( closestPoint, sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	 * Returns `true` if the given OBB intersects this OBB.
	 *
	 * @param {OBB} obb - The OBB to test.
	 * @param {number} [epsilon=Number.EPSILON] - A small value to prevent arithmetic errors.
	 * @returns {boolean} - Whether the given OBB intersects this OBB or not.
	 */
	intersectsOBB( obb, epsilon = Number.EPSILON ) {

		// Reference: OBB-OBB Intersection in Real-Time Collision Detection
		// by Christer Ericson (chapter 4.4.1)

		// prepare data structures (the code uses the same nomenclature like the reference)

		a.c = this.center;
		a.e[ 0 ] = this.halfSize.x;
		a.e[ 1 ] = this.halfSize.y;
		a.e[ 2 ] = this.halfSize.z;
		mat3ExtractBasis( this.rotation, a.u[ 0 ], a.u[ 1 ], a.u[ 2 ] );

		b.c = obb.center;
		b.e[ 0 ] = obb.halfSize.x;
		b.e[ 1 ] = obb.halfSize.y;
		b.e[ 2 ] = obb.halfSize.z;
		mat3ExtractBasis( obb.rotation, b.u[ 0 ], b.u[ 1 ], b.u[ 2 ] );

		// compute rotation matrix expressing b in a's coordinate frame

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				R[ i ][ j ] = vec3Dot( a.u[ i ], b.u[ j ] );

			}

		}

		// compute translation vector

		vec3SubVectors( b.c, a.c, v1 );

		// bring translation into a's coordinate frame

		t[ 0 ] = vec3Dot( v1, a.u[ 0 ] );
		t[ 1 ] = vec3Dot( v1, a.u[ 1 ] );
		t[ 2 ] = vec3Dot( v1, a.u[ 2 ] );

		// compute common subexpressions. Add in an epsilon term to
		// counteract arithmetic errors when two edges are parallel and
		// their cross product is (near) null

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				AbsR[ i ][ j ] = Math.abs( R[ i ][ j ] ) + epsilon;

			}

		}

		let ra, rb;

		// test axes L = A0, L = A1, L = A2

		for ( let i = 0; i < 3; i ++ ) {

			ra = a.e[ i ];
			rb = b.e[ 0 ] * AbsR[ i ][ 0 ] + b.e[ 1 ] * AbsR[ i ][ 1 ] + b.e[ 2 ] * AbsR[ i ][ 2 ];
			if ( Math.abs( t[ i ] ) > ra + rb ) return false;


		}

		// test axes L = B0, L = B1, L = B2

		for ( let i = 0; i < 3; i ++ ) {

			ra = a.e[ 0 ] * AbsR[ 0 ][ i ] + a.e[ 1 ] * AbsR[ 1 ][ i ] + a.e[ 2 ] * AbsR[ 2 ][ i ];
			rb = b.e[ i ];
			if ( Math.abs( t[ 0 ] * R[ 0 ][ i ] + t[ 1 ] * R[ 1 ][ i ] + t[ 2 ] * R[ 2 ][ i ] ) > ra + rb ) return false;

		}

		// test axis L = A0 x B0

		ra = a.e[ 1 ] * AbsR[ 2 ][ 0 ] + a.e[ 2 ] * AbsR[ 1 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 0 ][ 2 ] + b.e[ 2 ] * AbsR[ 0 ][ 1 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 0 ] - t[ 1 ] * R[ 2 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A0 x B1

		ra = a.e[ 1 ] * AbsR[ 2 ][ 1 ] + a.e[ 2 ] * AbsR[ 1 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 0 ][ 2 ] + b.e[ 2 ] * AbsR[ 0 ][ 0 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 1 ] - t[ 1 ] * R[ 2 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A0 x B2

		ra = a.e[ 1 ] * AbsR[ 2 ][ 2 ] + a.e[ 2 ] * AbsR[ 1 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 0 ][ 1 ] + b.e[ 1 ] * AbsR[ 0 ][ 0 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 2 ] - t[ 1 ] * R[ 2 ][ 2 ] ) > ra + rb ) return false;

		// test axis L = A1 x B0

		ra = a.e[ 0 ] * AbsR[ 2 ][ 0 ] + a.e[ 2 ] * AbsR[ 0 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 1 ][ 2 ] + b.e[ 2 ] * AbsR[ 1 ][ 1 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 0 ] - t[ 2 ] * R[ 0 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A1 x B1

		ra = a.e[ 0 ] * AbsR[ 2 ][ 1 ] + a.e[ 2 ] * AbsR[ 0 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 1 ][ 2 ] + b.e[ 2 ] * AbsR[ 1 ][ 0 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 1 ] - t[ 2 ] * R[ 0 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A1 x B2

		ra = a.e[ 0 ] * AbsR[ 2 ][ 2 ] + a.e[ 2 ] * AbsR[ 0 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 1 ][ 1 ] + b.e[ 1 ] * AbsR[ 1 ][ 0 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 2 ] - t[ 2 ] * R[ 0 ][ 2 ] ) > ra + rb ) return false;

		// test axis L = A2 x B0

		ra = a.e[ 0 ] * AbsR[ 1 ][ 0 ] + a.e[ 1 ] * AbsR[ 0 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 2 ][ 2 ] + b.e[ 2 ] * AbsR[ 2 ][ 1 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 0 ] - t[ 0 ] * R[ 1 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A2 x B1

		ra = a.e[ 0 ] * AbsR[ 1 ][ 1 ] + a.e[ 1 ] * AbsR[ 0 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 2 ][ 2 ] + b.e[ 2 ] * AbsR[ 2 ][ 0 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 1 ] - t[ 0 ] * R[ 1 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A2 x B2

		ra = a.e[ 0 ] * AbsR[ 1 ][ 2 ] + a.e[ 1 ] * AbsR[ 0 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 2 ][ 1 ] + b.e[ 1 ] * AbsR[ 2 ][ 0 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 2 ] - t[ 0 ] * R[ 1 ][ 2 ] ) > ra + rb ) return false;

		// since no separating axis is found, the OBBs must be intersecting

		return true;

	}

	/**
	 * Returns `true` if the given plane intersects this OBB.
	 *
	 * @param {Plane} plane - The plane to test.
	 * @returns {boolean} Whether the given plane intersects this OBB or not.
	 */
	intersectsPlane( plane ) {

		// Reference: Testing Box Against Plane in Real-Time Collision Detection
		// by Christer Ericson (chapter 5.2.3)

		mat3ExtractBasis( this.rotation, xAxis, yAxis, zAxis );

		// compute the projection interval radius of this OBB onto L(t) = this->center + t * p.normal;

		const r = this.halfSize.x * Math.abs( vec3Dot( plane.normal, xAxis ) ) +
				this.halfSize.y * Math.abs( vec3Dot( plane.normal, yAxis ) ) +
				this.halfSize.z * Math.abs( vec3Dot( plane.normal, zAxis ) );

		// compute distance of the OBB's center from the plane

		const d = vec3Dot( plane.normal, this.center ) - plane.constant;

		// Intersection occurs when distance d falls within [-r,+r] interval

		return Math.abs( d ) <= r;

	}

	/**
	 * Performs a ray/OBB intersection test and stores the intersection point
	 * in the given 3D vector.
	 *
	 * @param {Ray} ray - The ray to test.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The intersection point. If no intersection is detected, `null` is returned.
	 */
	intersectRay( ray, target ) {

		// the idea is to perform the intersection test in the local space
		// of the OBB.

		this.getSize( size );
		vec3Set( v1, 0, 0, 0 );
		box3SetFromCenterAndSize( v1, size, aabb );

		// create a 4x4 transformation matrix

		mat4SetFromMatrix3( this.rotation, matrix );
		mat4SetPosition( matrix, this.center.x, this.center.y, this.center.z, matrix );

		// transform ray to the local space of the OBB

		mat4Copy( matrix, inverse );
		mat4Invert( inverse, inverse );
		rayCopy( ray, localRay );
		rayApplyMatrix4( localRay, inverse, localRay );

		// perform ray <-> AABB intersection test

		if ( rayIntersectBox( localRay, aabb, target ) ) {

			// transform the intersection point back to world space

			return vec3ApplyMatrix4( target, matrix, target );

		} else {

			return null;

		}

	}

	/**
	 * Returns `true` if the given ray intersects this OBB.
	 *
	 * @param {Ray} ray - The ray to test.
	 * @returns {boolean} Whether the given ray intersects this OBB or not.
	 */
	intersectsRay( ray ) {

		return this.intersectRay( ray, v1 ) !== null;

	}

	/**
	 * Defines an OBB based on the given AABB.
	 *
	 * @param {Box3} box3 - The AABB to setup the OBB from.
	 * @return {OBB} A reference of this OBB.
	 */
	fromBox3( box3 ) {

		box3GetCenter( box3, this.center );

		box3GetSize( box3, this.halfSize );
		vec3MultiplyScalar( this.halfSize, 0.5, this.halfSize );

		mat3Identity( this.rotation );

		return this;

	}

	/**
	 * Returns `true` if the given OBB is equal to this OBB.
	 *
	 * @param {OBB} obb - The OBB to test.
	 * @returns {boolean} Whether the given OBB is equal to this OBB or not.
	 */
	equals( obb ) {

		return vec3Equals( obb.center, this.center ) &&
			vec3Equals( obb.halfSize, this.halfSize ) &&
			mat3Equals( obb.rotation, this.rotation );

	}

	/**
	 * Applies the given transformation matrix to this OBB. This method can be
	 * used to transform the bounding volume with the world matrix of a 3D object
	 * in order to keep both entities in sync.
	 *
	 * @param {Matrix4} matrix - The matrix to apply.
	 * @return {OBB} A reference of this OBB.
	 */
	applyMatrix4( matrix ) {

		const e = matrix.elements;

		vec3Set( v1, e[ 0 ], e[ 1 ], e[ 2 ] );
		let sx = vec3Length( v1 );
		vec3Set( v1, e[ 4 ], e[ 5 ], e[ 6 ] );
		const sy = vec3Length( v1 );
		vec3Set( v1, e[ 8 ], e[ 9 ], e[ 10 ] );
		const sz = vec3Length( v1 );

		const det = mat4Determinant( matrix );
		if ( det < 0 ) sx = - sx;

		mat3SetFromMatrix4( matrix, rotationMatrix );

		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;

		rotationMatrix.elements[ 0 ] *= invSX;
		rotationMatrix.elements[ 1 ] *= invSX;
		rotationMatrix.elements[ 2 ] *= invSX;

		rotationMatrix.elements[ 3 ] *= invSY;
		rotationMatrix.elements[ 4 ] *= invSY;
		rotationMatrix.elements[ 5 ] *= invSY;

		rotationMatrix.elements[ 6 ] *= invSZ;
		rotationMatrix.elements[ 7 ] *= invSZ;
		rotationMatrix.elements[ 8 ] *= invSZ;

		mat3Multiply( this.rotation, rotationMatrix, this.rotation );

		this.halfSize.x *= sx;
		this.halfSize.y *= sy;
		this.halfSize.z *= sz;

		vec3SetFromMatrixPosition( matrix, v1 );
		vec3Add( this.center, v1, this.center );

		return this;

	}

}

const obb = new OBB();

export { OBB };
