import {
	vec2Add,
	vec2AddScalar,
	vec2AddVectors,
	vec2Clamp,
	vec2Copy,
	vec2Create,
	vec2DistanceTo,
	vec2Equals,
	vec2Max,
	vec2Min,
	vec2MultiplyScalar,
	vec2Set,
	vec2Sub,
	vec2SubVectors
} from './Vector2Functions.js';

/**
 * A structural type describing any object with `{ x, y }` numeric
 * components, exactly like {@link Vector2}.
 *
 * @typedef {Object} Vector2Like
 * @property {number} x
 * @property {number} y
 */

/**
 * A structural type describing any object that stores a 2D axis-aligned
 * bounding box as `min` and `max` corners, exactly like {@link Box2}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Box2} instance. Since {@link Box2} exposes
 * compatible `min`/`max` fields, instances of that class satisfy this type
 * without any special handling.
 *
 * @typedef {Object} Box2Like
 * @property {Vector2Like} min - The lower boundary of the box.
 * @property {Vector2Like} max - The upper boundary of the box.
 */

const _clampVector = /*@__PURE__*/ vec2Create();

/**
 * Creates a new, plain {@link Box2Like} object in the empty default state
 * (min at `+Infinity`, max at `-Infinity`), matching `new Box2()`.
 *
 * Unlike `new Box2()`, the returned object is not a class instance and
 * carries no `isBox2` flag - it only satisfies the {@link Box2Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Box2} class so that unused box operations can be tree-shaken.
 *
 * @return {Box2Like} A new box-like object in the empty default state.
 */
export function box2Create() {

	return {

		min: vec2Create( + Infinity, + Infinity ),
		max: vec2Create( - Infinity, - Infinity )

	};

}

/**
 * Sets the lower and upper boundaries of the target by copying the given
 * values.
 *
 * @param {Vector2Like} min - The lower boundary of the box.
 * @param {Vector2Like} max - The upper boundary of the box.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2Set( min, max, target = box2Create() ) {

	vec2Copy( min, target.min );
	vec2Copy( max, target.max );

	return target;

}

/**
 * Sets the upper and lower bounds of the target so it encloses the position
 * data in the given array.
 *
 * @param {Array<Vector2Like>} points - An array holding 2D position data.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2SetFromPoints( points, target = box2Create() ) {

	box2MakeEmpty( target );

	for ( let i = 0, il = points.length; i < il; i ++ ) {

		box2ExpandByPoint( target, points[ i ], target );

	}

	return target;

}

/**
 * Centers the target on the given center vector and sets its width and
 * height to the given size values.
 *
 * @param {Vector2Like} center - The center of the box.
 * @param {Vector2Like} size - The x and y dimensions of the box.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2SetFromCenterAndSize( center, size, target = box2Create() ) {

	const hx = size.x * 0.5;
	const hy = size.y * 0.5;

	target.min.x = center.x - hx;
	target.min.y = center.y - hy;
	target.max.x = center.x + hx;
	target.max.y = center.y + hy;

	return target;

}

/**
 * Copies the values of the given box into the target.
 *
 * @param {Box2Like} box - The box to copy.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} A copy of `box`.
 */
export function box2Copy( box, target = box2Create() ) {

	vec2Copy( box.min, target.min );
	vec2Copy( box.max, target.max );

	return target;

}

/**
 * Makes the target empty which means it encloses a zero space in 2D.
 *
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2MakeEmpty( target = box2Create() ) {

	target.min.x = target.min.y = + Infinity;
	target.max.x = target.max.y = - Infinity;

	return target;

}

/**
 * Returns `true` if the box includes zero points within its bounds.
 * Note that a box with equal lower and upper bounds still includes one
 * point, the one both bounds share.
 *
 * @param {Box2Like} box - The box to test.
 * @return {boolean} Whether the box is empty or not.
 */
export function box2IsEmpty( box ) {

	// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

	return ( box.max.x < box.min.x ) || ( box.max.y < box.min.y );

}

/**
 * Returns the center point of the box.
 *
 * @param {Box2Like} box - The box.
 * @param {Vector2Like} [target] - The target vector the result is stored to.
 * @return {Vector2Like} The center point.
 */
export function box2GetCenter( box, target = vec2Create() ) {

	return box2IsEmpty( box ) ? vec2Set( 0, 0, target ) : vec2MultiplyScalar( vec2AddVectors( box.min, box.max, target ), 0.5, target );

}

/**
 * Returns the dimensions of the box.
 *
 * @param {Box2Like} box - The box.
 * @param {Vector2Like} [target] - The target vector the result is stored to.
 * @return {Vector2Like} The size.
 */
export function box2GetSize( box, target = vec2Create() ) {

	return box2IsEmpty( box ) ? vec2Set( 0, 0, target ) : vec2SubVectors( box.max, box.min, target );

}

/**
 * Expands the boundaries of the box to include the given point.
 *
 * @param {Box2Like} box - The box to expand.
 * @param {Vector2Like} point - The point that should be included.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2ExpandByPoint( box, point, target = box2Create() ) {

	vec2Min( box.min, point, target.min );
	vec2Max( box.max, point, target.max );

	return target;

}

/**
 * Expands the box equilaterally by the given vector. The width of the
 * box will be expanded by the x component of the vector in both
 * directions. The height of the box will be expanded by the y component of
 * the vector in both directions.
 *
 * @param {Box2Like} box - The box to expand.
 * @param {Vector2Like} vector - The vector that should expand the box.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2ExpandByVector( box, vector, target = box2Create() ) {

	vec2Sub( box.min, vector, target.min );
	vec2Add( box.max, vector, target.max );

	return target;

}

/**
 * Expands each dimension of the box by the given scalar. If negative, the
 * dimensions of the box will be contracted.
 *
 * @param {Box2Like} box - The box to expand.
 * @param {number} scalar - The scalar value that should expand the box.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2ExpandByScalar( box, scalar, target = box2Create() ) {

	vec2AddScalar( box.min, - scalar, target.min );
	vec2AddScalar( box.max, scalar, target.max );

	return target;

}

/**
 * Returns `true` if the given point lies within or on the boundaries of the box.
 *
 * @param {Box2Like} box - The box.
 * @param {Vector2Like} point - The point to test.
 * @return {boolean} Whether the box contains the given point or not.
 */
export function box2ContainsPoint( box, point ) {

	return point.x >= box.min.x && point.x <= box.max.x &&
		point.y >= box.min.y && point.y <= box.max.y;

}

/**
 * Returns `true` if the box includes the entirety of the given bounding box.
 * If both boxes are identical, this function also returns `true`.
 *
 * @param {Box2Like} box - The box.
 * @param {Box2Like} other - The bounding box to test.
 * @return {boolean} Whether the box contains the given bounding box or not.
 */
export function box2ContainsBox( box, other ) {

	return box.min.x <= other.min.x && other.max.x <= box.max.x &&
		box.min.y <= other.min.y && other.max.y <= box.max.y;

}

/**
 * Returns a point as a proportion of the box's width and height.
 *
 * @param {Box2Like} box - The box.
 * @param {Vector2Like} point - A point in 2D space.
 * @param {Vector2Like} [target] - The target vector the result is stored to.
 * @return {Vector2Like} A point as a proportion of the box's width and height.
 */
export function box2GetParameter( box, point, target = vec2Create() ) {

	// This can potentially have a divide by zero if the box
	// has a size dimension of 0.

	return vec2Set(
		( point.x - box.min.x ) / ( box.max.x - box.min.x ),
		( point.y - box.min.y ) / ( box.max.y - box.min.y ),
		target
	);

}

/**
 * Returns `true` if the given bounding box intersects with the box.
 *
 * @param {Box2Like} box - The box.
 * @param {Box2Like} other - The bounding box to test.
 * @return {boolean} Whether the given bounding box intersects with the box.
 */
export function box2IntersectsBox( box, other ) {

	// using 4 splitting planes to rule out intersections

	return other.max.x >= box.min.x && other.min.x <= box.max.x &&
		other.max.y >= box.min.y && other.min.y <= box.max.y;

}

/**
 * Clamps the given point within the bounds of the box.
 *
 * @param {Box2Like} box - The box.
 * @param {Vector2Like} point - The point to clamp.
 * @param {Vector2Like} [target] - The target vector the result is stored to.
 * @return {Vector2Like} The clamped point.
 */
export function box2ClampPoint( box, point, target = vec2Create() ) {

	return vec2Clamp( point, box.min, box.max, target );

}

/**
 * Returns the euclidean distance from any edge of the box to the specified
 * point. If the given point lies inside of the box, the distance will be `0`.
 *
 * @param {Box2Like} box - The box.
 * @param {Vector2Like} point - The point to compute the distance to.
 * @return {number} The euclidean distance.
 */
export function box2DistanceToPoint( box, point ) {

	return vec2DistanceTo( box2ClampPoint( box, point, _clampVector ), point );

}

/**
 * Computes the intersection of the box and the given one, setting the upper
 * bound of the result to the lesser of the two boxes' upper bounds and the
 * lower bound to the greater of the two boxes' lower bounds. If there's no
 * overlap, makes the result empty.
 *
 * @param {Box2Like} box - The first box.
 * @param {Box2Like} other - The bounding box to intersect with.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2Intersect( box, other, target = box2Create() ) {

	vec2Max( box.min, other.min, target.min );
	vec2Min( box.max, other.max, target.max );

	if ( box2IsEmpty( target ) ) box2MakeEmpty( target );

	return target;

}

/**
 * Computes the union of the box and another, setting the upper bound of the
 * result to the greater of the two boxes' upper bounds and the lower bound
 * to the lesser of the two boxes' lower bounds.
 *
 * @param {Box2Like} box - The first box.
 * @param {Box2Like} other - The bounding box that will be unioned.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2Union( box, other, target = box2Create() ) {

	vec2Min( box.min, other.min, target.min );
	vec2Max( box.max, other.max, target.max );

	return target;

}

/**
 * Adds the given offset to both the upper and lower bounds of the box,
 * effectively moving it in 2D space.
 *
 * @param {Box2Like} box - The box to translate.
 * @param {Vector2Like} offset - The offset that should be used to translate the box.
 * @param {Box2Like} [target] - The target the result is stored to.
 * @return {Box2Like} The target, for chaining.
 */
export function box2Translate( box, offset, target = box2Create() ) {

	vec2Add( box.min, offset, target.min );
	vec2Add( box.max, offset, target.max );

	return target;

}

/**
 * Returns `true` if the two boxes are equal.
 *
 * @param {Box2Like} a - The first box.
 * @param {Box2Like} b - The second box.
 * @return {boolean} Whether the two boxes are equal.
 */
export function box2Equals( a, b ) {

	return vec2Equals( a.min, b.min ) && vec2Equals( a.max, b.max );

}
