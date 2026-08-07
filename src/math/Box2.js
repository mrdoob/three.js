import {
	box2ClampPoint,
	box2ContainsBox,
	box2ContainsPoint,
	box2Copy,
	box2DistanceToPoint,
	box2Equals,
	box2ExpandByPoint,
	box2ExpandByScalar,
	box2ExpandByVector,
	box2GetCenter,
	box2GetParameter,
	box2GetSize,
	box2Intersect,
	box2IntersectsBox,
	box2IsEmpty,
	box2MakeEmpty,
	box2Set,
	box2SetFromCenterAndSize,
	box2SetFromPoints,
	box2Translate,
	box2Union
} from './Box2Functions.js';
import { Vector2 } from './Vector2.js';

/**
 * Represents an axis-aligned bounding box (AABB) in 2D space.
 *
 * `Box2` is a thin, backwards-compatible wrapper around the standalone,
 * tree-shakeable `box2*` functions in {@link Box2Functions}, which operate
 * on any {@link Box2Like} object. Prefer importing those functions
 * directly if you only need a handful of operations and want unused ones
 * eliminated from your bundle.
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

		return box2Set( min, max, this );

	}

	/**
	 * Sets the upper and lower bounds of this box so it encloses the position data
	 * in the given array.
	 *
	 * @param {Array<Vector2>} points - An array holding 2D position data as instances of {@link Vector2}.
	 * @return {Box2} A reference to this bounding box.
	 */
	setFromPoints( points ) {

		return box2SetFromPoints( points, this );

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

		return box2SetFromCenterAndSize( center, size, this );

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

		return box2Copy( box, this );

	}

	/**
	 * Makes this box empty which means in encloses a zero space in 2D.
	 *
	 * @return {Box2} A reference to this bounding box.
	 */
	makeEmpty() {

		return box2MakeEmpty( this );

	}

	/**
	 * Returns true if this box includes zero points within its bounds.
	 * Note that a box with equal lower and upper bounds still includes one
	 * point, the one both bounds share.
	 *
	 * @return {boolean} Whether this box is empty or not.
	 */
	isEmpty() {

		return box2IsEmpty( this );

	}

	/**
	 * Returns the center point of this box.
	 *
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} The center point.
	 */
	getCenter( target ) {

		return box2GetCenter( this, target );

	}

	/**
	 * Returns the dimensions of this box.
	 *
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} The size.
	 */
	getSize( target ) {

		return box2GetSize( this, target );

	}

	/**
	 * Expands the boundaries of this box to include the given point.
	 *
	 * @param {Vector2} point - The point that should be included by the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	expandByPoint( point ) {

		return box2ExpandByPoint( this, point, this );

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

		return box2ExpandByVector( this, vector, this );

	}

	/**
	 * Expands each dimension of the box by the given scalar. If negative, the
	 * dimensions of the box will be contracted.
	 *
	 * @param {number} scalar - The scalar value that should expand the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	expandByScalar( scalar ) {

		return box2ExpandByScalar( this, scalar, this );

	}

	/**
	 * Returns `true` if the given point lies within or on the boundaries of this box.
	 *
	 * @param {Vector2} point - The point to test.
	 * @return {boolean} Whether the bounding box contains the given point or not.
	 */
	containsPoint( point ) {

		return box2ContainsPoint( this, point );

	}

	/**
	 * Returns `true` if this bounding box includes the entirety of the given bounding box.
	 * If this box and the given one are identical, this function also returns `true`.
	 *
	 * @param {Box2} box - The bounding box to test.
	 * @return {boolean} Whether the bounding box contains the given bounding box or not.
	 */
	containsBox( box ) {

		return box2ContainsBox( this, box );

	}

	/**
	 * Returns a point as a proportion of this box's width and height.
	 *
	 * @param {Vector2} point - A point in 2D space.
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} A point as a proportion of this box's width and height.
	 */
	getParameter( point, target ) {

		return box2GetParameter( this, point, target );

	}

	/**
	 * Returns `true` if the given bounding box intersects with this bounding box.
	 *
	 * @param {Box2} box - The bounding box to test.
	 * @return {boolean} Whether the given bounding box intersects with this bounding box.
	 */
	intersectsBox( box ) {

		return box2IntersectsBox( this, box );

	}

	/**
	 * Clamps the given point within the bounds of this box.
	 *
	 * @param {Vector2} point - The point to clamp.
	 * @param {Vector2} target - The target vector that is used to store the method's result.
	 * @return {Vector2} The clamped point.
	 */
	clampPoint( point, target ) {

		return box2ClampPoint( this, point, target );

	}

	/**
	 * Returns the euclidean distance from any edge of this box to the specified point. If
	 * the given point lies inside of this box, the distance will be `0`.
	 *
	 * @param {Vector2} point - The point to compute the distance to.
	 * @return {number} The euclidean distance.
	 */
	distanceToPoint( point ) {

		return box2DistanceToPoint( this, point );

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

		return box2Intersect( this, box, this );

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

		return box2Union( this, box, this );

	}

	/**
	 * Adds the given offset to both the upper and lower bounds of this bounding box,
	 * effectively moving it in 2D space.
	 *
	 * @param {Vector2} offset - The offset that should be used to translate the bounding box.
	 * @return {Box2} A reference to this bounding box.
	 */
	translate( offset ) {

		return box2Translate( this, offset, this );

	}

	/**
	 * Returns `true` if this bounding box is equal with the given one.
	 *
	 * @param {Box2} box - The box to test for equality.
	 * @return {boolean} Whether this bounding box is equal with the given one.
	 */
	equals( box ) {

		return box2Equals( this, box );

	}

}

export { Box2 };
