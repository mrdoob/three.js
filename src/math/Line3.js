import { Vector3 } from './Vector3.js';
import { clamp } from './MathUtils.js';

const _startP = /*@__PURE__*/ new Vector3();
const _startEnd = /*@__PURE__*/ new Vector3();

class Line3 {

	constructor( start = new Vector3(), end = new Vector3() ) {

		this.start = start;
		this.end = end;

	}

	set( start, end ) {

		this.start.copy( start );
		this.end.copy( end );

		return this;

	}

	copy( line ) {

		this.start.copy( line.start );
		this.end.copy( line.end );

		return this;

	}

	getCenter( target ) {

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	}

	delta( target ) {

		return target.subVectors( this.end, this.start );

	}

	distanceSq() {

		return this.start.distanceToSquared( this.end );

	}

	distance() {

		return this.start.distanceTo( this.end );

	}

	at( t, target ) {

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	closestPointToPointParameter( point, clampToLine ) {

		_startP.subVectors( point, this.start );
		_startEnd.subVectors( this.end, this.start );

		const startEnd2 = _startEnd.dot( _startEnd );
		const startEnd_startP = _startEnd.dot( _startP );

		let t = startEnd_startP / startEnd2;

		if ( clampToLine ) {

			t = clamp( t, 0, 1 );

		}

		return t;

	}

	closestPointToPoint( point, clampToLine, target ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

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

	clone() {

		return new this.constructor().copy( this );

	}

}

export { Line3 };
