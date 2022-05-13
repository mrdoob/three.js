import {
	Box3,
	MathUtils,
	Matrix4,
	Matrix3,
	Ray,
	Vector3
} from 'three';

// module scope helper variables

const a = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

const b = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

const R = [[], [], []];
const AbsR = [[], [], []];
const t = [];

const xAxis = new Vector3();
const yAxis = new Vector3();
const zAxis = new Vector3();
const v1 = new Vector3();
const size = new Vector3();
const closestPoint = new Vector3();
const rotationMatrix = new Matrix3();
const aabb = new Box3();
const matrix = new Matrix4();
const inverse = new Matrix4();
const localRay = new Ray();

// OBB

class OBB {

	constructor( center = new Vector3(), halfSize = new Vector3(), rotation = new Matrix3() ) {

		this.center = center;
		this.halfSize = halfSize;
		this.rotation = rotation;

	}

	set( center, halfSize, rotation ) {

		this.center = center;
		this.halfSize = halfSize;
		this.rotation = rotation;

		return this;

	}

	copy( obb ) {

		this.center.copy( obb.center );
		this.halfSize.copy( obb.halfSize );
		this.rotation.copy( obb.rotation );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	getSize( result ) {

		return result.copy( this.halfSize ).multiplyScalar( 2 );

	}

	/**
	* Reference: Closest Point on OBB to Point in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.1.4)
	*/
	clampPoint( point, result ) {

		const halfSize = this.halfSize;

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// start at the center position of the OBB

		result.copy( this.center );

		// project the target onto the OBB axes and walk towards that point

		const x = MathUtils.clamp( v1.dot( xAxis ), - halfSize.x, halfSize.x );
		result.add( xAxis.multiplyScalar( x ) );

		const y = MathUtils.clamp( v1.dot( yAxis ), - halfSize.y, halfSize.y );
		result.add( yAxis.multiplyScalar( y ) );

		const z = MathUtils.clamp( v1.dot( zAxis ), - halfSize.z, halfSize.z );
		result.add( zAxis.multiplyScalar( z ) );

		return result;

	}

	containsPoint( point ) {

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// project v1 onto each axis and check if these points lie inside the OBB

		return Math.abs( v1.dot( xAxis ) ) <= this.halfSize.x &&
				Math.abs( v1.dot( yAxis ) ) <= this.halfSize.y &&
				Math.abs( v1.dot( zAxis ) ) <= this.halfSize.z;

	}

	intersectsBox3( box3 ) {

		return this.intersectsOBB( obb.fromBox3( box3 ) );

	}

	intersectsSphere( sphere ) {

		// find the point on the OBB closest to the sphere center

		this.clampPoint( sphere.center, closestPoint );

		// if that point is inside the sphere, the OBB and sphere intersect

		return closestPoint.distanceToSquared( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	* Reference: OBB-OBB Intersection in Real-Time Collision Detection
	* by Christer Ericson (chapter 4.4.1)
	*
	*/
	intersectsOBB( obb, epsilon = Number.EPSILON ) {

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

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

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
	* Reference: Testing Box Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.3)
	*/
	intersectsPlane( plane ) {

		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// compute the projection interval radius of this OBB onto L(t) = this->center + t * p.normal;

		const r = this.halfSize.x * Math.abs( plane.normal.dot( xAxis ) ) +
				this.halfSize.y * Math.abs( plane.normal.dot( yAxis ) ) +
				this.halfSize.z * Math.abs( plane.normal.dot( zAxis ) );

		// compute distance of the OBB's center from the plane

		const d = plane.normal.dot( this.center ) - plane.constant;

		// Intersection occurs when distance d falls within [-r,+r] interval

		return Math.abs( d ) <= r;

	}

	/**
	* Performs a ray/OBB intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*/
	intersectRay( ray, result ) {

		// the idea is to perform the intersection test in the local space
		// of the OBB.

		this.getSize( size );
		aabb.setFromCenterAndSize( v1.set( 0, 0, 0 ), size );

		// create a 4x4 transformation matrix

		matrix.setFromMatrix3( this.rotation );
		matrix.setPosition( this.center );

		// transform ray to the local space of the OBB

		inverse.copy( matrix ).invert();
		localRay.copy( ray ).applyMatrix4( inverse );

		// perform ray <-> AABB intersection test

		if ( localRay.intersectBox( aabb, result ) ) {

			// transform the intersection point back to world space

			return result.applyMatrix4( matrix );

		} else {

			return null;

		}

	}

	/**
	* Performs a ray/OBB intersection test. Returns either true or false if
	* there is a intersection or not.
	*/
	intersectsRay( ray ) {

		return this.intersectRay( ray, v1 ) !== null;

	}

	fromBox3( box3 ) {

		box3.getCenter( this.center );

		box3.getSize( this.halfSize ).multiplyScalar( 0.5 );

		this.rotation.identity();

		return this;

	}

	equals( obb ) {

		return obb.center.equals( this.center ) &&
			obb.halfSize.equals( this.halfSize ) &&
			obb.rotation.equals( this.rotation );

	}

	applyMatrix4( matrix ) {

		const e = matrix.elements;

		let sx = v1.set( e[ 0 ], e[ 1 ], e[ 2 ] ).length();
		const sy = v1.set( e[ 4 ], e[ 5 ], e[ 6 ] ).length();
		const sz = v1.set( e[ 8 ], e[ 9 ], e[ 10 ] ).length();

		const det = matrix.determinant();
		if ( det < 0 ) sx = - sx;

		rotationMatrix.setFromMatrix4( matrix );

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

		this.rotation.multiply( rotationMatrix );

		this.halfSize.x *= sx;
		this.halfSize.y *= sy;
		this.halfSize.z *= sz;

		v1.setFromMatrixPosition( matrix );
		this.center.add( v1 );

		return this;

	}

}

const obb = new OBB();

export { OBB };
