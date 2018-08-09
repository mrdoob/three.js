import { Vector3 } from './Vector3.js';
import { _Math } from './Math.js';

/**
 * @author bhouston / http://clara.io
 */

class Line3 {

	constructor( start, end ) {

		this.start = ( start !== undefined ) ? start : new Vector3();
		this.end = ( end !== undefined ) ? end : new Vector3();

	}

	set( start, end ) {

		this.start.copy( start );
		this.end.copy( end );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( line ) {

		this.start.copy( line.start );
		this.end.copy( line.end );

		return this;

	}

	getCenter( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .getCenter() target is now required' );
			target = new Vector3();

		}

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	}

	delta( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .delta() target is now required' );
			target = new Vector3();

		}

		return target.subVectors( this.end, this.start );

	}

	distanceSq() {

		return this.start.distanceToSquared( this.end );

	}

	distance() {

		return this.start.distanceTo( this.end );

	}

	at( t, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .at() target is now required' );
			target = new Vector3();

		}

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	closestPointToPoint( point, clampToLine, target ) {

		var t = this.closestPointToPointParameter( point, clampToLine );

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .closestPointToPoint() target is now required' );
			target = new Vector3();

		}

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	applyMatrix4( matrix ) {

		this.start.applyMatrix4( matrix );
		this.end.applyMatrix4( matrix );

		return this;

	}

	equals( line ) {

		return line.start.equals( this.start ) && line.end.equals( this.end );

	}

}

Line3.prototype.closestPointToPointParameter = function () {

	var startP = new Vector3();
	var startEnd = new Vector3();

	return function closestPointToPointParameter( point, clampToLine ) {

		startP.subVectors( point, this.start );
		startEnd.subVectors( this.end, this.start );

		var startEnd2 = startEnd.dot( startEnd );
		var startEnd_startP = startEnd.dot( startP );

		var t = startEnd_startP / startEnd2;

		if ( clampToLine ) {

			t = _Math.clamp( t, 0, 1 );

		}

		return t;

	};

}();


export { Line3 };
