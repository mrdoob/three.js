/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import {
	Box3,
	MathUtils,
	Matrix4,
	Matrix3,
	Ray,
	Vector3
} from "../../../build/three.module.js";

// module scope helper variables

var a = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

var b = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

var R = [[], [], []];
var AbsR = [[], [], []];
var t = [];

var xAxis = new Vector3();
var yAxis = new Vector3();
var zAxis = new Vector3();
var v1 = new Vector3();
var size = new Vector3();
var closestPoint = new Vector3();
var rotationMatrix = new Matrix3();
var aabb = new Box3();
var matrix = new Matrix4();
var inverse = new Matrix4();
var localRay = new Ray();

// OBB

function OBB( center = new Vector3(), halfSize = new Vector3(), rotation = new Matrix3() ) {

	this.center = center;
	this.halfSize = halfSize;
	this.rotation = rotation;

}

Object.assign( OBB.prototype, {

	set: function ( center, halfSize, rotation ) {

		this.center = center;
		this.halfSize = halfSize;
		this.rotation = rotation;

		return this;

	},

	copy: function ( obb ) {

		this.center.copy( obb.center );
		this.halfSize.copy( obb.halfSize );
		this.rotation.copy( obb.rotation );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	getSize: function ( result ) {

		return result.copy( this.halfSize ).multiplyScalar( 2 );

	},

	/**
	* Reference: Closest Point on OBB to Point in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.1.4)
	*/
	clampPoint: function ( point, result ) {

		var halfSize = this.halfSize;

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// start at the center position of the OBB

		result.copy( this.center );

		// project the target onto the OBB axes and walk towards that point

		var x = MathUtils.clamp( v1.dot( xAxis ), - halfSize.x, halfSize.x );
		result.add( xAxis.multiplyScalar( x ) );

		var y = MathUtils.clamp( v1.dot( yAxis ), - halfSize.y, halfSize.y );
		result.add( yAxis.multiplyScalar( y ) );

		var z = MathUtils.clamp( v1.dot( zAxis ), - halfSize.z, halfSize.z );
		result.add( zAxis.multiplyScalar( z ) );

		return result;

	},

	containsPoint: function ( point ) {

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// project v1 onto each axis and check if these points lie inside the OBB

		return Math.abs( v1.dot( xAxis ) ) <= this.halfSize.x &&
				Math.abs( v1.dot( yAxis ) ) <= this.halfSize.y &&
				Math.abs( v1.dot( zAxis ) ) <= this.halfSize.z;

	},

	intersectsBox3: function ( box3 ) {

		return this.intersectsOBB( obb.fromBox3( box3 ) );

	},

	intersectsSphere: function ( sphere ) {

		// find the point on the OBB closest to the sphere center

		this.clampPoint( sphere.center, closestPoint );

		// if that point is inside the sphere, the OBB and sphere intersect

		return closestPoint.distanceToSquared( sphere.center ) <= ( sphere.radius * sphere.radius );

	},

	/**
	* Reference: OBB-OBB Intersection in Real-Time Collision Detection
	* by Christer Ericson (chapter 4.4.1)
	*
	*/
	intersectsOBB: function ( obb, epsilon = Number.EPSILON ) {

		// prepare data structures (the code uses the same nomenclature like the reference)

		a.c = this.center;
		a.e[ 0 ] = this.halfSize.x;
		a.e[ 1 ] = this.halfSize.y;
		a.e[ 2 ] = this.halfSize.z;
		this.rotation.extractBasis( a.u[ 0 ], a.u[ 1 ], a.u[ 2 ] );

		b.c = obb.center;
		b.e[ 0 ] = obb.halfSize.x;
		b.e[ 1 ] = obb.halfSize.y;
		b.e[ 2 ] = obb.halfSize.z;
		obb.rotation.extractBasis( b.u[ 0 ], b.u[ 1 ], b.u[ 2 ] );

		// compute rotation matrix expressing b in a's coordinate frame

		for ( var i = 0; i < 3; i ++ ) {

			for ( var j = 0; j < 3; j ++ ) {

				R[ i ][ j ] = a.u[ i ].dot( b.u[ j ] );

			}

		}

		// compute translation vector

		v1.subVectors( b.c, a.c );

		// bring translation into a's coordinate frame

		t[ 0 ] = v1.dot( a.u[ 0 ] );
		t[ 1 ] = v1.dot( a.u[ 1 ] );
		t[ 2 ] = v1.dot( a.u[ 2 ] );

		// compute common subexpressions. Add in an epsilon term to
		// counteract arithmetic errors when two edges are parallel and
		// their cross product is (near) null

		for ( var i = 0; i < 3; i ++ ) {

			for ( var j = 0; j < 3; j ++ ) {

				AbsR[ i ][ j ] = Math.abs( R[ i ][ j ] ) + epsilon;

			}

		}

		var ra, rb;

		// test axes L = A0, L = A1, L = A2

		for ( var i = 0; i < 3; i ++ ) {

			ra = a.e[ i ];
			rb = b.e[ 0 ] * AbsR[ i ][ 0 ] + b.e[ 1 ] * AbsR[ i ][ 1 ] + b.e[ 2 ] * AbsR[ i ][ 2 ];
			if ( Math.abs( t[ i ] ) > ra + rb ) return false;


		}

		// test axes L = B0, L = B1, L = B2

		for ( var i = 0; i < 3; i ++ ) {

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

	},

	/**
	* Reference: Testing Box Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.3)
	*/
	intersectsPlane: function ( plane ) {

		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// compute the projection interval radius of this OBB onto L(t) = this->center + t * p.normal;

		const r = this.halfSize.x * Math.abs( plane.normal.dot( xAxis ) ) +
				this.halfSize.y * Math.abs( plane.normal.dot( yAxis ) ) +
				this.halfSize.z * Math.abs( plane.normal.dot( zAxis ) );

		// compute distance of the OBB's center from the plane

		const d = plane.normal.dot( this.center ) - plane.constant;

		// Intersection occurs when distance d falls within [-r,+r] interval

		return Math.abs( d ) <= r;

	},

	/**
	* Performs a ray/OBB intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*/
	intersectRay: function ( ray, result ) {

		// the idea is to perform the intersection test in the local space
		// of the OBB.

		this.getSize( size );
		aabb.setFromCenterAndSize( v1.set( 0, 0, 0 ), size );

		// create a 4x4 transformation matrix

		matrix4FromRotationMatrix( matrix, this.rotation );
		matrix.setPosition( this.center );

		// transform ray to the local space of the OBB

		localRay.copy( ray ).applyMatrix4( inverse.getInverse( matrix ) );

		// perform ray <-> AABB intersection test

		if ( localRay.intersectBox( aabb, result ) ) {

			// transform the intersection point back to world space

			return result.applyMatrix4( matrix );

		} else {

			return null;

		}

	},

	/**
	* Performs a ray/OBB intersection test. Returns either true or false if
	* there is a intersection or not.
	*/
	intersectsRay: function ( ray ) {

		return this.intersectRay( ray, v1 ) !== null;

	},

	fromBox3: function ( box3 ) {

		box3.getCenter( this.center );

		box3.getSize( this.halfSize ).multiplyScalar( 0.5 );

		this.rotation.identity();

		return this;

	},

	equals: function ( obb ) {

		return obb.center.equals( this.center ) &&
			obb.halfSize.equals( this.halfSize ) &&
			obb.rotation.equals( this.rotation );

	},

	applyMatrix4: function ( matrix ) {

		var e = matrix.elements;

		var sx = v1.set( e[ 0 ], e[ 1 ], e[ 2 ] ).length();
		var sy = v1.set( e[ 4 ], e[ 5 ], e[ 6 ] ).length();
		var sz = v1.set( e[ 8 ], e[ 9 ], e[ 10 ] ).length();

		var det = matrix.determinant();
		if ( det < 0 ) sx = - sx;

		rotationMatrix.setFromMatrix4( matrix );

		var invSX = 1 / sx;
		var invSY = 1 / sy;
		var invSZ = 1 / sz;

		rotationMatrix.elements[ 0 ] *= invSX;
		rotationMatrix.elements[ 1 ] *= invSX;
		rotationMatrix.elements[ 2 ] *= invSX;

		rotationMatrix.elements[ 3 ] *= invSY;
		rotationMatrix.elements[ 4 ] *= invSY;
		rotationMatrix.elements[ 5 ] *= invSY;

		rotationMatrix.elements[ 6 ] *= invSZ;
		rotationMatrix.elements[ 7 ] *= invSZ;
		rotationMatrix.elements[ 8 ] *= invSZ;

		this.rotation.multiply( rotationMatrix );

		this.halfSize.x *= sx;
		this.halfSize.y *= sy;
		this.halfSize.z *= sz;

		v1.setFromMatrixPosition( matrix );
		this.center.add( v1 );

		return this;

	}

} );

function matrix4FromRotationMatrix( matrix4, matrix3 ) {

	var e = matrix4.elements;
	var me = matrix3.elements;

	e[ 0 ] = me[ 0 ];
	e[ 1 ] = me[ 1 ];
	e[ 2 ] = me[ 2 ];
	e[ 3 ] = 0;

	e[ 4 ] = me[ 3 ];
	e[ 5 ] = me[ 4 ];
	e[ 6 ] = me[ 5 ];
	e[ 7 ] = 0;

	e[ 8 ] = me[ 6 ];
	e[ 9 ] = me[ 7 ];
	e[ 10 ] = me[ 8 ];
	e[ 11 ] = 0;

	e[ 12 ] = 0;
	e[ 13 ] = 0;
	e[ 14 ] = 0;
	e[ 15 ] = 1;

}

var obb = new OBB();

export { OBB };
