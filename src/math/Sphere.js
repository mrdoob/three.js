import { Box3 } from './Box3.js';
import { Vector3 } from './Vector3.js';

const _box = /*@__PURE__*/ new Box3();
const _v1 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();

/**
 * An analytical 3D sphere defined by a center and radius. This class is mainly
 * used as a Bounding Sphere for 3D objects.
 */
class Sphere {

	/**
	 * Constructs a new sphere.
	 *
	 * @param {Vector3} [center=(0,0,0)] - The center of the sphere
	 * @param {number} [radius=-1] - The radius of the sphere.
	 */
	constructor( center = new Vector3(), radius = - 1 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSphere = true;

		/**
		 * The center of the sphere
		 *
		 * @type {Vector3}
		 */
		this.center = center;

		/**
		 * The radius of the sphere.
		 *
		 * @type {number}
		 */
		this.radius = radius;

	}

	/**
	 * Sets the sphere's components by copying the given values.
	 *
	 * @param {Vector3} center - The center.
	 * @param {number} radius - The radius.
	 * @return {Sphere} A reference to this sphere.
	 */
	set( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;

	}

	/**
	 * Computes the minimum bounding sphere for list of points.
	 * If the optional center point is given, it is used as the sphere's
	 * center. Otherwise, the center of the axis-aligned bounding box
	 * encompassing the points is calculated.
	 *
	 * @param {Array<Vector3>} points - A list of points in 3D space.
	 * @param {Vector3} [optionalCenter] - The center of the sphere.
	 * @return {Sphere} A reference to this sphere.
	 */
	setFromPoints( points, optionalCenter ) {

		const center = this.center;

		if ( optionalCenter !== undefined ) {

			center.copy( optionalCenter );

		} else {

			_box.setFromPoints( points ).getCenter( center );

		}

		let maxRadiusSq = 0;

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );

		}

		this.radius = Math.sqrt( maxRadiusSq );

		return this;

	}

	/**
	 * Copies the values of the given sphere to this instance.
	 *
	 * @param {Sphere} sphere - The sphere to copy.
	 * @return {Sphere} A reference to this sphere.
	 */
	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	/**
	 * Returns `true` if the sphere is empty (the radius set to a negative number).
	 *
	 * Spheres with a radius of `0` contain only their center point and are not
	 * considered to be empty.
	 *
	 * @return {boolean} Whether this sphere is empty or not.
	 */
	isEmpty() {

		return ( this.radius < 0 );

	}

	/**
	 * Makes this sphere empty which means in encloses a zero space in 3D.
	 *
	 * @return {Sphere} A reference to this sphere.
	 */
	makeEmpty() {

		this.center.set( 0, 0, 0 );
		this.radius = - 1;

		return this;

	}

	/**
	 * Returns `true` if this sphere contains the given point inclusive of
	 * the surface of the sphere.
	 *
	 * @param {Vector3} point - The point to check.
	 * @return {boolean} Whether this sphere contains the given point or not.
	 */
	containsPoint( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	}

	/**
	 * Returns the closest distance from the boundary of the sphere to the
	 * given point. If the sphere contains the point, the distance will
	 * be negative.
	 *
	 * @param {Vector3} point - The point to compute the distance to.
	 * @return {number} The distance to the point.
	 */
	distanceToPoint( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	}

	/**
	 * Returns `true` if this sphere intersects with the given one.
	 *
	 * @param {Sphere} sphere - The sphere to test.
	 * @return {boolean} Whether this sphere intersects with the given one or not.
	 */
	intersectsSphere( sphere ) {

		const radiusSum = this.radius + sphere.radius;

		return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	}

	/**
	 * Returns `true` if this sphere intersects with the given box.
	 *
	 * @param {Box3} box - The box to test.
	 * @return {boolean} Whether this sphere intersects with the given box or not.
	 */
	intersectsBox( box ) {

		return box.intersectsSphere( this );

	}

	/**
	 * Returns `true` if this sphere intersects with the given plane.
	 *
	 * @param {Plane} plane - The plane to test.
	 * @return {boolean} Whether this sphere intersects with the given plane or not.
	 */
	intersectsPlane( plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	/**
	 * Clamps a point within the sphere. If the point is outside the sphere, it
	 * will clamp it to the closest point on the edge of the sphere. Points
	 * already inside the sphere will not be affected.
	 *
	 * @param {Vector3} point - The plane to clamp.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The clamped point.
	 */
	clampPoint( point, target ) {

		const deltaLengthSq = this.center.distanceToSquared( point );

		target.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );

		}

		return target;

	}

	/**
	 * Returns a bounding box that encloses this sphere.
	 *
	 * @param {Box3} target - The target box that is used to store the method's result.
	 * @return {Box3} The bounding box that encloses this sphere.
	 */
	getBoundingBox( target ) {

		if ( this.isEmpty() ) {

			// Empty sphere produces empty bounding box
			target.makeEmpty();
			return target;

		}

		target.set( this.center, this.center );
		target.expandByScalar( this.radius );

		return target;

	}

	/**
	 * Transforms this sphere with the given 4x4 transformation matrix.
	 *
	 * @param {Matrix4} matrix - The transformation matrix.
	 * @return {Sphere} A reference to this sphere.
	 */
	applyMatrix4( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	}

	/**
	 * Translates the sphere's center by the given offset.
	 *
	 * @param {Vector3} offset - The offset.
	 * @return {Sphere} A reference to this sphere.
	 */
	translate( offset ) {

		this.center.add( offset );

		return this;

	}

	/**
	 * Expands the boundaries of this sphere to include the given point.
	 *
	 * @param {Vector3} point - The point to include.
	 * @return {Sphere} A reference to this sphere.
	 */
	expandByPoint( point ) {

		if ( this.isEmpty() ) {

			this.center.copy( point );

			this.radius = 0;

			return this;

		}

		_v1.subVectors( point, this.center );

		const lengthSq = _v1.lengthSq();

		if ( lengthSq > ( this.radius * this.radius ) ) {

			// calculate the minimal sphere

			const length = Math.sqrt( lengthSq );

			const delta = ( length - this.radius ) * 0.5;

			this.center.addScaledVector( _v1, delta / length );

			this.radius += delta;

		}

		return this;

	}

	/**
	 * Expands this sphere to enclose both the original sphere and the given sphere.
	 *
	 * @param {Sphere} sphere - The sphere to include.
	 * @return {Sphere} A reference to this sphere.
	 */
	union( sphere ) {

		if ( sphere.isEmpty() ) {

			return this;

		}

		if ( this.isEmpty() ) {

			this.copy( sphere );

			return this;

		}

		if ( this.center.equals( sphere.center ) === true ) {

			 this.radius = Math.max( this.radius, sphere.radius );

		} else {

			_v2.subVectors( sphere.center, this.center ).setLength( sphere.radius );

			this.expandByPoint( _v1.copy( sphere.center ).add( _v2 ) );

			this.expandByPoint( _v1.copy( sphere.center ).sub( _v2 ) );

		}

		return this;

	}

	/**
	 * Returns `true` if this sphere is equal with the given one.
	 *
	 * @param {Sphere} sphere - The sphere to test for equality.
	 * @return {boolean} Whether this bounding sphere is equal with the given one.
	 */
	equals( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	}

	/**
	 * Returns a new sphere with copied values from this instance.
	 *
	 * @return {Sphere} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Returns a serialized structure of the bounding sphere.
	 *
	 * @return {Object} Serialized structure with fields representing the object state.
	 */
	toJSON() {

		return {
			radius: this.radius,
			center: this.center.toArray()
		};

	}

	/**
	 * Returns a serialized structure of the bounding sphere.
	 *
	 * @param {Object} json - The serialized json to set the sphere from.
	 * @return {Box3} A reference to this bounding sphere.
	 */
	fromJSON( json ) {

		this.radius = json.radius;
		this.center.fromArray( json.center );
		return this;

	}

}

export { Sphere };
