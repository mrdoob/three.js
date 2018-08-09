import { Matrix3 } from './Matrix3.js';
import { Vector3 } from './Vector3.js';

/**
 * @author bhouston / http://clara.io
 */

class Plane {

	constructor( normal, constant ) {

		// normal is assumed to be normalized

		this.normal = ( normal !== undefined ) ? normal : new Vector3( 1, 0, 0 );
		this.constant = ( constant !== undefined ) ? constant : 0;

	}

	set( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;

	}

	setComponents( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;

	}

	setFromNormalAndCoplanarPoint( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	}

	normalize() {

		// Note: will lead to a divide by zero if the plane is invalid.

		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;

	}

	negate() {

		this.constant *= - 1;
		this.normal.negate();

		return this;

	}

	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	distanceToSphere( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;

	}

	projectPoint( point, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Plane: .projectPoint() target is now required' );
			target = new Vector3();

		}

		return target.copy( this.normal ).multiplyScalar( - this.distanceToPoint( point ) ).add( point );

	}

	intersectsLine( line ) {

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

		var startSign = this.distanceToPoint( line.start );
		var endSign = this.distanceToPoint( line.end );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

	}

	intersectsBox( box ) {

		return box.intersectsPlane( this );

	}

	intersectsSphere( sphere ) {

		return sphere.intersectsPlane( this );

	}

	coplanarPoint( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Plane: .coplanarPoint() target is now required' );
			target = new Vector3();

		}

		return target.copy( this.normal ).multiplyScalar( - this.constant );

	}

	translate( offset ) {

		this.constant -= offset.dot( this.normal );

		return this;

	}

	equals( plane ) {

		return plane.normal.equals( this.normal ) && ( plane.constant === this.constant );

	}

}

Plane.prototype.setFromCoplanarPoints = function () {

	var v1 = new Vector3();
	var v2 = new Vector3();

	return function setFromCoplanarPoints( a, b, c ) {

		var normal = v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();

		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

		this.setFromNormalAndCoplanarPoint( normal, a );

		return this;

	};

}();

Plane.prototype.intersectLine = function () {

	var v1 = new Vector3();

	return function intersectLine( line, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Plane: .intersectLine() target is now required' );
			target = new Vector3();

		}

		var direction = line.delta( v1 );

		var denominator = this.normal.dot( direction );

		if ( denominator === 0 ) {

			// line is coplanar, return origin
			if ( this.distanceToPoint( line.start ) === 0 ) {

				return target.copy( line.start );

			}

			// Unsure if this is the correct method to handle this case.
			return undefined;

		}

		var t = - ( line.start.dot( this.normal ) + this.constant ) / denominator;

		if ( t < 0 || t > 1 ) {

			return undefined;

		}

		return target.copy( direction ).multiplyScalar( t ).add( line.start );

	};

}();

Plane.prototype.applyMatrix4 = function () {

	var v1 = new Vector3();
	var m1 = new Matrix3();

	return function applyMatrix4( matrix, optionalNormalMatrix ) {

		var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix( matrix );

		var referencePoint = this.coplanarPoint( v1 ).applyMatrix4( matrix );

		var normal = this.normal.applyMatrix3( normalMatrix ).normalize();

		this.constant = - referencePoint.dot( normal );

		return this;

	};

}();


export { Plane };
