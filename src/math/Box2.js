import { Vector2 } from './Vector2.js';

const _vector = /*@__PURE__*/ new Vector2();

/**
 * Represents an axis-aligned bounding box (AABB) in 2D space.
 */
class Box2 {

	/**
	 * Creates a Box2 bounded by min and max.
	 * @param {Vector2} min (optional) {@link Vector2} representing the lower (x, y) boundary of the box. Default is ( + Infinity, + Infinity ).
	 * @param {Vector2} max (optional) {@link Vector2} representing the upper (x, y) boundary of the box. Default is ( - Infinity, - Infinity ).
	 */
	constructor( min = new Vector2( + Infinity, + Infinity ), max = new Vector2( - Infinity, - Infinity ) ) {

		this.isBox2 = true;

		/**
		 * {@link Vector2} representing the lower (x, y) boundary of the box.
		 * Default is ( + Infinity, + Infinity ).
		 * @type {Vector2}
		 */
		this.min = min;

		/**
		 * {@link Vector2} representing the lower upper (x, y) boundary of the box.
		 * Default is ( - Infinity, - Infinity ).
		 * @type {Vector2}
		 */
		this.max = max;

	}

	/**
	 * Sets the lower and upper (x, y) boundaries of this box.
	 * Please note that this method only copies the values from the given objects.
	 * @param {Vector2} min {@link Vector2} representing the lower (x, y) boundary of the box.
	 * @param {Vector2} max {@link Vector2} representing the upper (x, y) boundary of the box.
	 * @returns {this}
	 */
	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	/**
	 * Sets the upper and lower bounds of this box to include all of the points in points.
	 * @param {Vector2[]} points Array of {@link Vector2}s that the resulting box will contain.
	 * @returns {this}
	 */
	setFromPoints( points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	}

	/**
	 * Centers this box on [center]{@link Vector2} and sets this box's width and height to the values specified in [size]{@link Vector2}.
	 * @param {Vector2} center Desired center position of the box ({@link Vector2}).
	 * @param {Vector2} size Desired x and y dimensions of the box ({@link Vector2}).
	 * @returns {this}
	 */
	setFromCenterAndSize( center, size ) {

		const halfSize = _vector.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	/**
	 * Returns a new {@link Box2} with the same min and max as this one.
	 * @returns {Box2}
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the {@link .min} and {@link .max} from box to this [box]{@link Box2}.
	 * @param {Box2} box
	 * @returns {this}
	 */
	copy( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	}

	/**
	 * Makes this box empty.
	 * @returns {this}
	 */
	makeEmpty() {

		this.min.x = this.min.y = + Infinity;
		this.max.x = this.max.y = - Infinity;

		return this;

	}

	/**
	 * Returns true if this box includes zero points within its bounds.
	 * Note that a box with equal lower and upper bounds still includes one point, the one both bounds share.
	 * @returns {boolean}
	 */
	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	}

	/**
	 * Returns the center point of the box as a {@link Vector2}.
	 * @param {Vector2} target the result will be copied into this Vector2.
	 * @returns {Vector2}
	 */
	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	/**
	 * Returns the width and height of this box.
	 * @param {Vector2} target the result will be copied into this Vector2.
	 * @returns {Vector2}
	 */
	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );

	}

	/**
	 * Expands the boundaries of this box to include [point]{@link Vector2}.
	 * @param {Vector2} point {@link Vector2} that should be included in the box.
	 * @returns {this}
	 */
	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	/**
	 * Expands this box equilaterally by [vector]{@link Vector2}. The width of this box will be expanded by the x component of [vector]{@link Vector2} in both directions. The height of this box will be expanded by the y component of [vector]{@link Vector2} in both directions.
	 * @param {Vector2} vector {@link Vector2} to expand the box by.
	 * @returns {this}
	 */
	expandByVector( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	}

	/**
	 * Expands each dimension of the box by scalar. If negative, the dimensions of the box will be contracted.
	 * @param {number} scalar
	 * @returns {Box2}
	 */
	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	/**
	 * Returns true if the specified [point]{@link Vector2} lies within or on the boundaries of this box.
	 * @param {Vector2} point {@link Vector2} to check for inclusion.
	 * @returns {boolean}
	 */
	containsPoint( point ) {

		return point.x >= this.min.x && point.x <= this.max.x &&
			point.y >= this.min.y && point.y <= this.max.y;

	}

	/**
	 * Returns true if the specified point lies within or on the boundaries of this [box]{@link Box2}. If this and [box]{@link Box2} are identical, this function also returns true.
	 * @param {Box2} box {@link Box2} to test for inclusion.
	 * @returns {boolean}
	 */
	containsBox( box ) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y;

	}

	/**
	 * Returns a point as a proportion of this box's width and height.
	 * @param {Vector2} point {@link Vector2}.
	 * @param {Vector2} target the result will be copied into this Vector2.
	 * @returns {Vector2}
	 */
	getParameter( point, target ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		return target.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y )
		);

	}

	/**
	 * Determines whether or not this box intersects [box]{@link Box2}.
	 * @param box Box to check for intersection against.
	 * @returns {boolean}
	 */
	intersectsBox( box ) {

		// using 4 splitting planes to rule out intersections

		return box.max.x >= this.min.x && box.min.x <= this.max.x &&
			box.max.y >= this.min.y && box.min.y <= this.max.y;

	}

	/**
	 * [Clamps]{@link https://en.wikipedia.org/wiki/Clamping_(graphics)} the [point]{@link Vector2} within the bounds of this box.
	 * @param {Vector2} point {@link Vector2} to clamp.
	 * @param {Vector2} target the result will be copied into this Vector2.
	 * @returns {Vector2}
	 */
	clampPoint( point, target ) {

		return target.copy( point ).clamp( this.min, this.max );

	}

	/**
	 * Returns the distance from any edge of this box to the specified point. If the [point]{@link Vector2} lies inside of this box, the distance will be `0`.
	 * @param {Vector2} point {@link Vector2} to measure distance to.
	 * @returns {number}
	 */
	distanceToPoint( point ) {

		return this.clampPoint( point, _vector ).distanceTo( point );

	}

	/**
	 * Returns the intersection of this and [box]{@link Box2}, setting the upper bound of this box to the lesser of the two boxes' upper bounds and the lower bound of this box to the greater of the two boxes' lower bounds.
	 * @param {Box2} box Box to intersect with.
	 * @returns {this}
	 */
	intersect( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	/**
	 * Unions this box with [box]{@link Box2}, setting the upper bound of this box to the greater of the two boxes' upper bounds and the lower bound of this box to the lesser of the two boxes' lower bounds.
	 * @param {Box2} box Box that will be unioned with this box.
	 * @returns {this}
	 */
	union( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	}

	/**
	 * Adds [offset]{@link Vector2} to both the upper and lower bounds of this box, effectively moving this box [offset]{@link Vector2} units in 2D space.
	 * @param {Vector2} offset Direction and distance of offset.
	 * @returns {this}
	 */
	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	/**
	 * Returns true if this box and [box]{@link Box2} share the same lower and upper bounds.
	 * @param {Box2} box Box to compare with this one.
	 * @returns {boolean}
	 */
	equals( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

}

export { Box2 };
