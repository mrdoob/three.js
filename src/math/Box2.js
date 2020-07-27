import { Vector2 } from './Vector2.js';

/**
 * @author bhouston / http://clara.io
 */

const _vector = new Vector2();

/**
 * @class
 * @param {Vector2=} min
 * @param {Vector2=} max
 */
function Box2( min, max ) {

	this.min = ( min !== undefined ) ? min : new Vector2( + Infinity, + Infinity );
	this.max = ( max !== undefined ) ? max : new Vector2( - Infinity, - Infinity );

}

Box2.prototype = {

	/**
	 * @param {Vector2} min
	 * @param {Vector2} max
	 */
	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	},

	setFromPoints( /** @type {Vector2[]} */ points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	},

	setFromCenterAndSize(
		/** @type {Vector2} */ center,
		/** @type {Vector2} */ size,
	) {

		const halfSize = _vector.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	},

	clone() {

		// For now type casting is needed for the static constructor calls to be
		// properly typed (issue: https://github.com/microsoft/TypeScript/issues/3841)
		const Ctor = /** @type {typeof Box2}  */( this.constructor );

		return new Ctor().copy( this );

	},

	/** @param {Box2} box */
	copy( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	},

	makeEmpty() {

		this.min.x = this.min.y = + Infinity;
		this.max.x = this.max.y = - Infinity;

		return this;

	},

	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	},

	/** @param {Vector2} target */
	getCenter( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Box2: .getCenter() target is now required' );
			target = new Vector2();

		}

		return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	},

	/** @param {Vector2} target */
	getSize( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Box2: .getSize() target is now required' );
			target = new Vector2();

		}

		return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );

	},

	/** @param {Vector2} point */
	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	},

	/** @param {Vector2} vector */
	expandByVector( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	},

	/** @param {number} scalar */
	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	},

	/** @param {Vector2} point */
	containsPoint( point ) {

		return point.x < this.min.x || point.x > this.max.x ||
			point.y < this.min.y || point.y > this.max.y ? false : true;

	},

	/** @param {Box2} box */
	containsBox( box ) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y;

	},

	/**
	 * @param {Vector2} point
	 * @param {Vector2} target
	 */
	getParameter( point, target ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		if ( target === undefined ) {

			console.warn( 'THREE.Box2: .getParameter() target is now required' );
			target = new Vector2();

		}

		return target.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y )
		);

	},

	/** @param {Box2} box */
	intersectsBox( box ) {

		// using 4 splitting planes to rule out intersections

		return box.max.x < this.min.x || box.min.x > this.max.x ||
			box.max.y < this.min.y || box.min.y > this.max.y ? false : true;

	},

	/**
	 * @param {Vector2} point
	 * @param {Vector2} target
	 */
	clampPoint( point, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Box2: .clampPoint() target is now required' );
			target = new Vector2();

		}

		return target.copy( point ).clamp( this.min, this.max );

	},

	/** @param {Vector2} point */
	distanceToPoint( point ) {

		const clampedPoint = _vector.copy( point ).clamp( this.min, this.max );
		return clampedPoint.sub( point ).length();

	},

	/** @param {Box2} box */
	intersect( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		return this;

	},

	/** @param {Box2} box */
	union( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	},

	/** @param {Vector2} offset */
	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	},

	/** @param {Box2} box */
	equals( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

};


export { Box2 };
