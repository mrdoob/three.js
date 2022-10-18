import { Box3 } from './Box3.js';
import { Vector3 } from './Vector3.js';

const _box = /*@__PURE__*/ new Box3();
const _v1 = /*@__PURE__*/ new Vector3();
const _toFarthestPoint = /*@__PURE__*/ new Vector3();
const _toPoint = /*@__PURE__*/ new Vector3();

class Sphere {

	constructor( center = new Vector3(), radius = - 1 ) {

		this.center = center;
		this.radius = radius;

	}

	set( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;

	}

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

	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	isEmpty() {

		return ( this.radius < 0 );

	}

	makeEmpty() {

		this.center.set( 0, 0, 0 );
		this.radius = - 1;

		return this;

	}

	containsPoint( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	}

	distanceToPoint( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	}

	intersectsSphere( sphere ) {

		const radiusSum = this.radius + sphere.radius;

		return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	}

	intersectsBox( box ) {

		return box.intersectsSphere( this );

	}

	intersectsPlane( plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	clampPoint( point, target ) {

		const deltaLengthSq = this.center.distanceToSquared( point );

		target.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );

		}

		return target;

	}

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

	applyMatrix4( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	}

	translate( offset ) {

		this.center.add( offset );

		return this;

	}

	expandByPoint( point ) {

		if ( this.isEmpty() ) {

			this.center.copy( point );
			this.radius = 0;

			return this;

		}

		// from https://github.com/juj/MathGeoLib/blob/2940b99b99cfe575dd45103ef20f4019dee15b54/src/Geometry/Sphere.cpp#L649-L671

		_toPoint.subVectors( point, this.center );

		const lengthSq = _toPoint.lengthSq();

		if ( lengthSq > ( this.radius * this.radius ) ) {

			const length = Math.sqrt( lengthSq );
			const missingRadiusHalf = ( length - this.radius ) * 0.5;

			// Nudge this sphere towards the target point. Add half the missing distance to radius,
			// and the other half to position. This gives a tighter enclosure, instead of if
			// the whole missing distance were just added to radius.

			this.center.add( _toPoint.multiplyScalar( missingRadiusHalf / length ) );
			this.radius += missingRadiusHalf;

		}

		return this;

	}

	union( sphere ) {

		// handle empty sphere cases
		if ( sphere.isEmpty() ) {

			return this;

		} else if ( this.isEmpty() ) {

			this.copy( sphere );

			return this;

		}

		// from https://github.com/juj/MathGeoLib/blob/2940b99b99cfe575dd45103ef20f4019dee15b54/src/Geometry/Sphere.cpp#L759-L769

		// To enclose another sphere into this sphere, we only need to enclose two points:
		// 1) Enclose the farthest point on the other sphere into this sphere.
		// 2) Enclose the opposite point of the farthest point into this sphere.

		 if ( this.center.equals( sphere.center ) === true ) {

			 _toFarthestPoint.set( 0, 0, 1 ).multiplyScalar( sphere.radius );


		} else {

			_toFarthestPoint.subVectors( sphere.center, this.center ).normalize().multiplyScalar( sphere.radius );

		}

		this.expandByPoint( _v1.copy( sphere.center ).add( _toFarthestPoint ) );
		this.expandByPoint( _v1.copy( sphere.center ).sub( _toFarthestPoint ) );

		return this;

	}

	equals( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

export { Sphere };
