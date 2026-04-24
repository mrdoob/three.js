import { Vector2 } from './Vector2.js';

const _vector = /*@__PURE__*/ new Vector2();

/**
 * Represents an axis-aligned bounding box (AABB) in 2D space.
 */
class Box2 {

	/**
	 * Constructs a new bounding box.
	 *
	 * @param {Vector2} [min=(Infinity,Infinity)] - A vector representing the lower boundary of the box.
	 * @param {Vector2} [max=(-Infinity,-Infinity)] - A vector representing the upper boundary of the box.
	 */
	constructor( min = new Vector2( + Infinity, + Infinity ), max = new Vector2( - Infinity, - Infinity ) ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBox2 = true;

		/**
		 * The lower boundary of the box.
		 *
		 * @type {Vector2}
		 */
		this.min = min;

		/**
		 * The upper boundary of the box.
		 *
		 * @type {Vector2}
		 */
		this.max = max;

	}

	/**
	 * Sets the lower and upper boundaries of this box.
	 * Please note that this method only copies the values from the given objects.
	 *
	 * @param {Vector2} min - The lower boundary of the box.
	 * @param {Vector2} max - The upper boundary of the box.
	 * @return {Box2} A reference to this bounding box.
	 */
	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	/**
	 * Sets the upper and lower bounds of this box so it encloses the position data
	 * in the given array.
	 *
	 * @param {Array<Vector2>} points - An array holding 2D position data as instances of {@link Vector2}.
	 * @return {Box2} A reference to this bounding box.
	 */
	setFromPoints( points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	}

	/**
	 * Centers this box on the given center vector and sets this box's width, height and
	 * depth to the given size values.
	 *
	 * @param {Vector2} center - The center of the box.
	 * @param {Vector2} size - The x and y dimensions of the box.
	 * @return {Box2} A reference to this bounding box.
	 */
	setFromCenterAndSize( center, size ) {

		const halfSize = _vector.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	/**
	 * Returns a new box with copied values from this instance.
	 *
	 * @return {Box2} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given box to this instance.
	 *
	 * @param {Box2} box - The box to copy.
	 * @return {Box2} A reference to this bounding box.
	 */
	copy( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	}

	/**
	 * Makes this box empty which means in encloses a zero space in 2D.
	 *
	 * @return {Box2} A reference to this bounding box.
	 */
	makeEmpty() {

		this.min.x = this.min.y = + Infinity;
		this.max.x = this.max.y = - Infinity;

		return this;

	}

	/**
	 * Returns true if this box includes zero points within its bounds.
	 * Note that a box with equal lower and upper bounds still includes one
	 * point, the one both bounds share.
	 *
	 * @return {boolean} Whether this box is empty or not.
	 */
	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	}

	/**
	 * Returns the center point of this box.
	 *
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} The center point.
	 */
	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	/**
	 * Returns the dimensions of this box.
	 *
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} The size.
	 */
	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );

	}

	/**
	 * Expands the boundaries of this box to include the given point.
	 *
	 * @param {Vector2} point - The point that should be included by the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	/**
	 * Expands this box equilaterally by the given vector. The width of this
	 * box will be expanded by the x component of the vector in both
	 * directions. The height of this box will be expanded by the y component of
	 * the vector in both directions.
	 *
	 * @param {Vector2} vector - The vector that should expand the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	expandByVector( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	}

	/**
	 * Expands each dimension of the box by the given scalar. If negative, the
	 * dimensions of the box will be contracted.
	 *
	 * @param {number} scalar - The scalar value that should expand the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	/**
	 * Returns `true` if the given point lies within or on the boundaries of this box.
	 *
	 * @param {Vector2} point - The point to test.
	 * @return {boolean} Whether the bounding box contains the given point or not.
	 */
	containsPoint( point ) {

		return point.x >= this.min.x && point.x <= this.max.x &&
			point.y >= this.min.y && point.y <= this.max.y;

	}

	/**
	 * Returns `true` if this bounding box includes the entirety of the given bounding box.
	 * If this box and the given one are identical, this function also returns `true`.
	 *
	 * @param {Box2} box - The bounding box to test.
	 * @return {boolean} Whether the bounding box contains the given bounding box or not.
	 */
	containsBox( box ) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y;

	}

	/**
	 * Returns a point as a proportion of this box's width and height.
	 *
	 * @param {Vector2} point - A point in 2D space.
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} A point as a proportion of this box's width and height.
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
	 * Returns `true` if the given bounding box intersects with this bounding box.
	 *
	 * @param {Box2} box - The bounding box to test.
	 * @return {boolean} Whether the given bounding box intersects with this bounding box.
	 */
	intersectsBox( box ) {

		// using 4 splitting planes to rule out intersections

		return box.max.x >= this.min.x && box.min.x <= this.max.x &&
			box.max.y >= this.min.y && box.min.y <= this.max.y;

	}

	/**
	 * Clamps the given point within the bounds of this box.
	 *
	 * @param {Vector2} point - The point to clamp.
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} The clamped point.
	 */
	clampPoint( point, target ) {

		return target.copy( point ).clamp( this.min, this.max );

	}

	/**
	 * Returns the euclidean distance from any edge of this box to the specified point. If
	 * the given point lies inside of this box, the distance will be `0`.
	 *
	 * @param {Vector2} point - The point to compute the distance to.
	 * @return {number} The euclidean distance.
	 */
	distanceToPoint( point ) {

		return this.clampPoint( point, _vector ).distanceTo( point );

	}

	/**
	 * Computes the intersection of this bounding box and the given one, setting the upper
	 * bound of this box to the lesser of the two boxes' upper bounds and the
	 * lower bound of this box to the greater of the two boxes' lower bounds. If
	 * there's no overlap, makes this box empty.
	 *
	 * @param {Box2} box - The bounding box to intersect with.
	 * @return {Box2} A reference to this bounding box.
	 */
	intersect( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	/**
	 * Computes the union of this box and another and the given one, setting the upper
	 * bound of this box to the greater of the two boxes' upper bounds and the
	 * lower bound of this box to the lesser of the two boxes' lower bounds.
	 *
	 * @param {Box2} box - The bounding box that will be unioned with this instance.
	 * @return {Box2} A reference to this bounding box.
	 */
	union( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	}

	/**
	 * Adds the given offset to both the upper and lower bounds of this bounding box,
	 * effectively moving it in 2D space.
	 *
	 * @param {Vector2} offset - The offset that should be used to translate the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	/**
	 * Returns `true` if this bounding box is equal with the given one.
	 *
	 * @param {Box2} box - The box to test for equality.
	 * @return {boolean} Whether this bounding box is equal with the given one.
	 */
	equals( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

}

export { Box2 };
