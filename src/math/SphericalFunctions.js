import { clamp } from './MathUtils.js';

/**
 * A structural type describing any object that stores spherical coordinates
 * as `radius`, `phi`, and `theta`, exactly like {@link Spherical}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Spherical} instance. Since {@link Spherical}
 * exposes compatible fields, instances of that class satisfy this type
 * without any special handling.
 *
 * @typedef {Object} SphericalLike
 * @property {number} radius - The radius, or the Euclidean distance from the point to the origin.
 * @property {number} phi - The polar angle in radians from the y (up) axis.
 * @property {number} theta - The equator/azimuthal angle in radians around the y (up) axis.
 */

/**
 * Creates a new, plain {@link SphericalLike} object with default spherical
 * coordinates (`radius = 1`, `phi = 0`, `theta = 0`).
 *
 * Unlike `new Spherical()`, the returned object is not a class instance —
 * it only satisfies the {@link SphericalLike} shape. This keeps
 * functional-only call sites free of any dependency on the {@link Spherical}
 * class so that unused spherical operations can be tree-shaken.
 *
 * @return {SphericalLike} A new spherical-like object in the default state.
 */
export function sphericalCreate() {

	return { radius: 1, phi: 0, theta: 0 };

}

/**
 * Sets the spherical components of the given target by copying the given values.
 *
 * @param {SphericalLike} target - The spherical-like object to modify.
 * @param {number} radius - The radius.
 * @param {number} phi - The polar angle.
 * @param {number} theta - The azimuthal angle.
 * @return {SphericalLike} The target, for chaining.
 */
export function sphericalSet( target, radius, phi, theta ) {

	target.radius = radius;
	target.phi = phi;
	target.theta = theta;

	return target;

}

/**
 * Copies the values of the given spherical into the target.
 *
 * @param {SphericalLike} other - The spherical to copy.
 * @param {SphericalLike} [target] - The target the result is stored to.
 * @return {SphericalLike} A copy of `other`.
 */
export function sphericalCopy( other, target = sphericalCreate() ) {

	target.radius = other.radius;
	target.phi = other.phi;
	target.theta = other.theta;

	return target;

}

/**
 * Restricts the polar angle `phi` of the given spherical to be between
 * `0.000001` and `pi - 0.000001`.
 *
 * @param {SphericalLike} s - The spherical to make safe.
 * @param {SphericalLike} [target] - The target the result is stored to.
 * @return {SphericalLike} The target with a safe `phi`.
 */
export function sphericalMakeSafe( s, target = sphericalCreate() ) {

	if ( target !== s ) {

		target.radius = s.radius;
		target.phi = s.phi;
		target.theta = s.theta;

	}

	const EPS = 0.000001;
	target.phi = clamp( target.phi, EPS, Math.PI - EPS );

	return target;

}

/**
 * Sets the spherical components from the given vector which is assumed to
 * hold Cartesian coordinates.
 *
 * @param {Vector3Like} v - The vector to set from.
 * @param {SphericalLike} [target] - The target the result is stored to.
 * @return {SphericalLike} The target, for chaining.
 */
export function sphericalSetFromVector3( v, target = sphericalCreate() ) {

	return sphericalSetFromCartesianCoords( v.x, v.y, v.z, target );

}

/**
 * Sets the spherical components from the given Cartesian coordinates.
 *
 * @param {number} x - The x value.
 * @param {number} y - The y value.
 * @param {number} z - The z value.
 * @param {SphericalLike} [target] - The target the result is stored to.
 * @return {SphericalLike} The target, for chaining.
 */
export function sphericalSetFromCartesianCoords( x, y, z, target = sphericalCreate() ) {

	target.radius = Math.sqrt( x * x + y * y + z * z );

	if ( target.radius === 0 ) {

		target.theta = 0;
		target.phi = 0;

	} else {

		target.theta = Math.atan2( x, z );
		target.phi = Math.acos( clamp( y / target.radius, - 1, 1 ) );

	}

	return target;

}
