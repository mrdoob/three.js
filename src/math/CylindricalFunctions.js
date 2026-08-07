/**
 * A structural type describing any object that stores cylindrical
 * coordinates as `radius`, `theta`, and `y`, exactly like {@link Cylindrical}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Cylindrical} instance. Since {@link Cylindrical}
 * exposes compatible fields, instances of that class satisfy this type
 * without any special handling.
 *
 * @typedef {Object} CylindricalLike
 * @property {number} radius - The distance from the origin to a point in the x-z plane.
 * @property {number} theta - A counterclockwise angle in the x-z plane measured in radians from the positive z-axis.
 * @property {number} y - The height above the x-z plane.
 */

/**
 * A structural type describing any object with Cartesian `x`, `y`, `z`
 * components, used by {@link cylindricalSetFromVector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * Creates a new, plain {@link CylindricalLike} object with default cylindrical
 * coordinates (`radius = 1`, `theta = 0`, `y = 0`).
 *
 * Unlike `new Cylindrical()`, the returned object is not a class instance -
 * it only satisfies the {@link CylindricalLike} shape. This keeps
 * functional-only call sites free of any dependency on the {@link Cylindrical}
 * class so that unused operations can be tree-shaken.
 *
 * @return {CylindricalLike} A new cylindrical-like object in the default state.
 */
export function cylindricalCreate() {

	return { radius: 1, theta: 0, y: 0 };

}

/**
 * Sets the cylindrical components of the given target by copying the given values.
 *
 * @param {number} radius - The radius.
 * @param {number} theta - The theta angle.
 * @param {number} y - The height value.
 * @param {CylindricalLike} [target] - The target the result is stored to.
 * @return {CylindricalLike} The target, for chaining.
 */
export function cylindricalSet( radius, theta, y, target = cylindricalCreate() ) {

	target.radius = radius;
	target.theta = theta;
	target.y = y;

	return target;

}

/**
 * Copies the values of the given cylindrical into the target.
 *
 * @param {CylindricalLike} other - The cylindrical to copy.
 * @param {CylindricalLike} [target] - The target the result is stored to.
 * @return {CylindricalLike} A copy of `other`.
 */
export function cylindricalCopy( other, target = cylindricalCreate() ) {

	target.radius = other.radius;
	target.theta = other.theta;
	target.y = other.y;

	return target;

}

/**
 * Sets the cylindrical components of the target from the given vector which
 * is assumed to hold Cartesian coordinates.
 *
 * @param {Vector3Like} v - The vector to set from.
 * @param {CylindricalLike} [target] - The target the result is stored to.
 * @return {CylindricalLike} The target, for chaining.
 */
export function cylindricalSetFromVector3( v, target = cylindricalCreate() ) {

	return cylindricalSetFromCartesianCoords( v.x, v.y, v.z, target );

}

/**
 * Sets the cylindrical components of the target from the given Cartesian
 * coordinates.
 *
 * @param {number} x - The x value.
 * @param {number} y - The y value.
 * @param {number} z - The z value.
 * @param {CylindricalLike} [target] - The target the result is stored to.
 * @return {CylindricalLike} The target, for chaining.
 */
export function cylindricalSetFromCartesianCoords( x, y, z, target = cylindricalCreate() ) {

	target.radius = Math.sqrt( x * x + z * z );
	target.theta = Math.atan2( x, z );
	target.y = y;

	return target;

}
