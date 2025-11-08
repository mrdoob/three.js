import { Vector3 } from './Vector3.js';

const _vector = /*@__PURE__*/ new Vector3();
const _segCenter = /*@__PURE__*/ new Vector3();
const _segDir = /*@__PURE__*/ new Vector3();
const _diff = /*@__PURE__*/ new Vector3();

const _edge1 = /*@__PURE__*/ new Vector3();
const _edge2 = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();

/**
 * A ray that emits from an origin in a certain direction. The class is used by
 * {@link Raycaster} to assist with raycasting. Raycasting is used for
 * mouse picking (working out what objects in the 3D space the mouse is over)
 * amongst other things.
 */
class Ray {

	/**
	 * Constructs a new ray.
	 *
	 * @param {Vector3} [origin=(0,0,0)] - The origin of the ray.
	 * @param {Vector3} [direction=(0,0,-1)] - The (normalized) direction of the ray.
	 */
	constructor( origin = new Vector3(), direction = new Vector3( 0, 0, - 1 ) ) {

		/**
		 * The origin of the ray.
		 *
		 * @type {Vector3}
		 */
		this.origin = origin;

		/**
		 * The (normalized) direction of the ray.
		 *
		 * @type {Vector3}
		 */
		this.direction = direction;

	}

	/**
	 * Sets the ray's components by copying the given values.
	 *
	 * @param {Vector3} origin - The origin.
	 * @param {Vector3} direction - The direction.
	 * @return {Ray} A reference to this ray.
	 */
	set( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	}

	/**
	 * Copies the values of the given ray to this instance.
	 *
	 * @param {Ray} ray - The ray to copy.
	 * @return {Ray} A reference to this ray.
	 */
	copy( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	}

	/**
	 * Returns a vector that is located at a given distance along this ray.
	 *
	 * @param {number} t - The distance along the ray to retrieve a position for.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} A position on the ray.
	 */
	at( t, target ) {

		return target.copy( this.origin ).addScaledVector( this.direction, t );

	}

	/**
	 * Adjusts the direction of the ray to point at the given vector in world space.
	 *
	 * @param {Vector3} v - The target position.
	 * @return {Ray} A reference to this ray.
	 */
	lookAt( v ) {

		this.direction.copy( v ).sub( this.origin ).normalize();

		return this;

	}

	/**
	 * Shift the origin of this ray along its direction by the given distance.
	 *
	 * @param {number} t - The distance along the ray to interpolate.
	 * @return {Ray} A reference to this ray.
	 */
	recast( t ) {

		this.origin.copy( this.at( t, _vector ) );

		return this;

	}

	/**
	 * Returns the point along this ray that is closest to the given point.
	 *
	 * @param {Vector3} point - A point in 3D space to get the closet location on the ray for.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The closest point on this ray.
	 */
	closestPointToPoint( point, target ) {

		target.subVectors( point, this.origin );

		const directionDistance = target.dot( this.direction );

		if ( directionDistance < 0 ) {

			return target.copy( this.origin );

		}

		return target.copy( this.origin ).addScaledVector( this.direction, directionDistance );

	}

	/**
	 * Returns the distance of the closest approach between this ray and the given point.
	 *
	 * @param {Vector3} point - A point in 3D space to compute the distance to.
	 * @return {number} The distance.
	 */
	distanceToPoint( point ) {

		return Math.sqrt( this.distanceSqToPoint( point ) );

	}

	/**
	 * Returns the squared distance of the closest approach between this ray and the given point.
	 *
	 * @param {Vector3} point - A point in 3D space to compute the distance to.
	 * @return {number} The squared distance.
	 */
	distanceSqToPoint( point ) {

		const directionDistance = _vector.subVectors( point, this.origin ).dot( this.direction );

		// point behind the ray

		if ( directionDistance < 0 ) {

			return this.origin.distanceToSquared( point );

		}

		_vector.copy( this.origin ).addScaledVector( this.direction, directionDistance );

		return _vector.distanceToSquared( point );

	}

	/**
	 * Returns the squared distance between this ray and the given line segment.
	 *
	 * @param {Vector3} v0 - The start point of the line segment.
	 * @param {Vector3} v1 - The end point of the line segment.
	 * @param {Vector3} [optionalPointOnRay] - When provided, it receives the point on this ray that is closest to the segment.
	 * @param {Vector3} [optionalPointOnSegment] - When provided, it receives the point on the line segment that is closest to this ray.
	 * @return {number} The squared distance.
	 */
	distanceSqToSegment( v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
		// It returns the min distance between the ray and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest point on the ray
		// - The closest point on the segment

		_segCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
		_segDir.copy( v1 ).sub( v0 ).normalize();
		_diff.copy( this.origin ).sub( _segCenter );

		const segExtent = v0.distanceTo( v1 ) * 0.5;
		const a01 = - this.direction.dot( _segDir );
		const b0 = _diff.dot( this.direction );
		const b1 = - _diff.dot( _segDir );
		const c = _diff.lengthSq();
		const det = Math.abs( 1 - a01 * a01 );
		let s0, s1, sqrDist, extDet;

		if ( det > 0 ) {

			// The ray and segment are not parallel.

			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;

			if ( s0 >= 0 ) {

				if ( s1 >= - extDet ) {

					if ( s1 <= extDet ) {

						// region 0
						// Minimum at interior points of ray and segment.

						const invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

					} else {

						// region 1

						s1 = segExtent;
						s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

					}

				} else {

					// region 5

					s1 = - segExtent;
					s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			} else {

				if ( s1 <= - extDet ) {

					// region 4

					s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				} else if ( s1 <= extDet ) {

					// region 3

					s0 = 0;
					s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = s1 * ( s1 + 2 * b1 ) + c;

				} else {

					// region 2

					s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			}

		} else {

			// Ray and segment are parallel.

			s1 = ( a01 > 0 ) ? - segExtent : segExtent;
			s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
			sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

		}

		if ( optionalPointOnRay ) {

			optionalPointOnRay.copy( this.origin ).addScaledVector( this.direction, s0 );

		}

		if ( optionalPointOnSegment ) {

			optionalPointOnSegment.copy( _segCenter ).addScaledVector( _segDir, s1 );

		}

		return sqrDist;

	}

	/**
	 * Intersects this ray with the given sphere, returning the intersection
	 * point or `null` if there is no intersection.
	 *
	 * @param {Sphere} sphere - The sphere to intersect.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The intersection point.
	 */
	intersectSphere( sphere, target ) {

		_vector.subVectors( sphere.center, this.origin );
		const tca = _vector.dot( this.direction );
		const d2 = _vector.dot( _vector ) - tca * tca;
		const radius2 = sphere.radius * sphere.radius;

		if ( d2 > radius2 ) return null;

		const thc = Math.sqrt( radius2 - d2 );

		// t0 = first intersect point - entrance on front of sphere
		const t0 = tca - thc;

		// t1 = second intersect point - exit point on back of sphere
		const t1 = tca + thc;

		// test to see if t1 is behind the ray - if so, return null
		if ( t1 < 0 ) return null;

		// test to see if t0 is behind the ray:
		// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
		// in order to always return an intersect point that is in front of the ray.
		if ( t0 < 0 ) return this.at( t1, target );

		// else t0 is in front of the ray, so return the first collision point scaled by t0
		return this.at( t0, target );

	}

	/**
	 * Returns `true` if this ray intersects with the given sphere.
	 *
	 * @param {Sphere} sphere - The sphere to intersect.
	 * @return {boolean} Whether this ray intersects with the given sphere or not.
	 */
	intersectsSphere( sphere ) {

		if ( sphere.radius < 0 ) return false; // handle empty spheres, see #31187

		return this.distanceSqToPoint( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	 * Computes the distance from the ray's origin to the given plane. Returns `null` if the ray
	 * does not intersect with the plane.
	 *
	 * @param {Plane} plane - The plane to compute the distance to.
	 * @return {?number} Whether this ray intersects with the given sphere or not.
	 */
	distanceToPlane( plane ) {

		const denominator = plane.normal.dot( this.direction );

		if ( denominator === 0 ) {

			// line is coplanar, return origin
			if ( plane.distanceToPoint( this.origin ) === 0 ) {

				return 0;

			}

			// Null is preferable to undefined since undefined means.... it is undefined

			return null;

		}

		const t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		// Return if the ray never intersects the plane

		return t >= 0 ? t : null;

	}

	/**
	 * Intersects this ray with the given plane, returning the intersection
	 * point or `null` if there is no intersection.
	 *
	 * @param {Plane} plane - The plane to intersect.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The intersection point.
	 */
	intersectPlane( plane, target ) {

		const t = this.distanceToPlane( plane );

		if ( t === null ) {

			return null;

		}

		return this.at( t, target );

	}

	/**
	 * Returns `true` if this ray intersects with the given plane.
	 *
	 * @param {Plane} plane - The plane to intersect.
	 * @return {boolean} Whether this ray intersects with the given plane or not.
	 */
	intersectsPlane( plane ) {

		// check if the ray lies on the plane first

		const distToPoint = plane.distanceToPoint( this.origin );

		if ( distToPoint === 0 ) {

			return true;

		}

		const denominator = plane.normal.dot( this.direction );

		if ( denominator * distToPoint < 0 ) {

			return true;

		}

		// ray origin is behind the plane (and is pointing behind it)

		return false;

	}

	/**
	 * Intersects this ray with the given bounding box, returning the intersection
	 * point or `null` if there is no intersection.
	 *
	 * @param {Box3} box - The box to intersect.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The intersection point.
	 */
	intersectBox( box, target ) {

		let tmin, tmax, tymin, tymax, tzmin, tzmax;

		const invdirx = 1 / this.direction.x,
			invdiry = 1 / this.direction.y,
			invdirz = 1 / this.direction.z;

		const origin = this.origin;

		if ( invdirx >= 0 ) {

			tmin = ( box.min.x - origin.x ) * invdirx;
			tmax = ( box.max.x - origin.x ) * invdirx;

		} else {

			tmin = ( box.max.x - origin.x ) * invdirx;
			tmax = ( box.min.x - origin.x ) * invdirx;

		}

		if ( invdiry >= 0 ) {

			tymin = ( box.min.y - origin.y ) * invdiry;
			tymax = ( box.max.y - origin.y ) * invdiry;

		} else {

			tymin = ( box.max.y - origin.y ) * invdiry;
			tymax = ( box.min.y - origin.y ) * invdiry;

		}

		if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

		if ( tymin > tmin || isNaN( tmin ) ) tmin = tymin;

		if ( tymax < tmax || isNaN( tmax ) ) tmax = tymax;

		if ( invdirz >= 0 ) {

			tzmin = ( box.min.z - origin.z ) * invdirz;
			tzmax = ( box.max.z - origin.z ) * invdirz;

		} else {

			tzmin = ( box.max.z - origin.z ) * invdirz;
			tzmax = ( box.min.z - origin.z ) * invdirz;

		}

		if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

		if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		//return point closest to the ray (positive side)

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, target );

	}

	/**
	 * Returns `true` if this ray intersects with the given box.
	 *
	 * @param {Box3} box - The box to intersect.
	 * @return {boolean} Whether this ray intersects with the given box or not.
	 */
	intersectsBox( box ) {

		return this.intersectBox( box, _vector ) !== null;

	}

	/**
	 * Intersects this ray with the given triangle, returning the intersection
	 * point or `null` if there is no intersection.
	 *
	 * @param {Vector3} a - The first vertex of the triangle.
	 * @param {Vector3} b - The second vertex of the triangle.
	 * @param {Vector3} c - The third vertex of the triangle.
	 * @param {boolean} backfaceCulling - Whether to use backface culling or not.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The intersection point.
	 */
	intersectTriangle( a, b, c, backfaceCulling, target ) {

		// Compute the offset origin, edges, and normal.

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

		_edge1.subVectors( b, a );
		_edge2.subVectors( c, a );
		_normal.crossVectors( _edge1, _edge2 );

		// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
		// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
		//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
		//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
		//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
		let DdN = this.direction.dot( _normal );
		let sign;

		if ( DdN > 0 ) {

			if ( backfaceCulling ) return null;
			sign = 1;

		} else if ( DdN < 0 ) {

			sign = - 1;
			DdN = - DdN;

		} else {

			return null;

		}

		_diff.subVectors( this.origin, a );
		const DdQxE2 = sign * this.direction.dot( _edge2.crossVectors( _diff, _edge2 ) );

		// b1 < 0, no intersection
		if ( DdQxE2 < 0 ) {

			return null;

		}

		const DdE1xQ = sign * this.direction.dot( _edge1.cross( _diff ) );

		// b2 < 0, no intersection
		if ( DdE1xQ < 0 ) {

			return null;

		}

		// b1+b2 > 1, no intersection
		if ( DdQxE2 + DdE1xQ > DdN ) {

			return null;

		}

		// Line intersects triangle, check if ray does.
		const QdN = - sign * _diff.dot( _normal );

		// t < 0, no intersection
		if ( QdN < 0 ) {

			return null;

		}

		// Ray intersects triangle.
		return this.at( QdN / DdN, target );

	}

	/**
	 * Transforms this ray with the given 4x4 transformation matrix.
	 *
	 * @param {Matrix4} matrix4 - The transformation matrix.
	 * @return {Ray} A reference to this ray.
	 */
	applyMatrix4( matrix4 ) {

		this.origin.applyMatrix4( matrix4 );
		this.direction.transformDirection( matrix4 );

		return this;

	}

	/**
	 * Returns `true` if this ray is equal with the given one.
	 *
	 * @param {Ray} ray - The ray to test for equality.
	 * @return {boolean} Whether this ray is equal with the given one.
	 */
	equals( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	}

	/**
	 * Returns a new ray with copied values from this instance.
	 *
	 * @return {Ray} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { Ray };
