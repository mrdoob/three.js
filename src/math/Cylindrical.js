/**
 * This class can be used to represent points in 3D space as
 * [Cylindrical coordinates](https://en.wikipedia.org/wiki/Cylindrical_coordinate_system).
 */
class Cylindrical {

	/**
	 * Constructs a new cylindrical.
	 *
	 * @param {number} [radius=1] - The distance from the origin to a point in the x-z plane.
	 * @param {number} [theta=0] - A counterclockwise angle in the x-z plane measured in radians from the positive z-axis.
	 * @param {number} [y=0] - The height above the x-z plane.
	 */
	constructor( radius = 1, theta = 0, y = 0 ) {

		/**
		 * The distance from the origin to a point in the x-z plane.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.radius = radius;

		/**
		 * A counterclockwise angle in the x-z plane measured in radians from the positive z-axis.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.theta = theta;

		/**
		 * The height above the x-z plane.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.y = y;

	}

	/**
	 * Sets the cylindrical components by copying the given values.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} theta - The theta angle.
	 * @param {number} y - The height value.
	 * @return {Cylindrical} A reference to this cylindrical.
	 */
	set( radius, theta, y ) {

		this.radius = radius;
		this.theta = theta;
		this.y = y;

		return this;

	}

	/**
	 * Copies the values of the given cylindrical to this instance.
	 *
	 * @param {Cylindrical} other - The cylindrical to copy.
	 * @return {Cylindrical} A reference to this cylindrical.
	 */
	copy( other ) {

		this.radius = other.radius;
		this.theta = other.theta;
		this.y = other.y;

		return this;

	}

	/**
	 * Sets the cylindrical components from the given vector which is assumed to hold
	 * Cartesian coordinates.
	 *
	 * @param {Vector3} v - The vector to set.
	 * @return {Cylindrical} A reference to this cylindrical.
	 */
	setFromVector3( v ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	/**
	 * Sets the cylindrical components from the given Cartesian coordinates.
	 *
	 * @param {number} x - The x value.
	 * @param {number} y - The x value.
	 * @param {number} z - The x value.
	 * @return {Cylindrical} A reference to this cylindrical.
	 */
	setFromCartesianCoords( x, y, z ) {

		this.radius = Math.sqrt( x * x + z * z );
		this.theta = Math.atan2( x, z );
		this.y = y;

		return this;

	}

	/**
	 * Returns a new cylindrical with copied values from this instance.
	 *
	 * @return {Cylindrical} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { Cylindrical };
