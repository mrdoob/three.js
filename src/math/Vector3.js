import {
	vec3Add,
	vec3AddScalar,
	vec3AddScaledVector,
	vec3AddVectors,
	vec3AngleTo,
	vec3ApplyAxisAngle,
	vec3ApplyEuler,
	vec3ApplyMatrix3,
	vec3ApplyMatrix4,
	vec3ApplyNormalMatrix,
	vec3ApplyQuaternion,
	vec3Ceil,
	vec3Clamp,
	vec3ClampLength,
	vec3ClampScalar,
	vec3Copy,
	vec3Cross,
	vec3CrossVectors,
	vec3DistanceTo,
	vec3DistanceToSquared,
	vec3Divide,
	vec3DivideScalar,
	vec3Dot,
	vec3Equals,
	vec3Floor,
	vec3FromArray,
	vec3FromBufferAttribute,
	vec3GetComponent,
	vec3Length,
	vec3LengthSq,
	vec3Lerp,
	vec3LerpVectors,
	vec3ManhattanDistanceTo,
	vec3ManhattanLength,
	vec3Max,
	vec3Min,
	vec3Multiply,
	vec3MultiplyScalar,
	vec3MultiplyVectors,
	vec3Negate,
	vec3Normalize,
	vec3Project,
	vec3ProjectOnPlane,
	vec3ProjectOnVector,
	vec3Random,
	vec3RandomDirection,
	vec3Reflect,
	vec3Round,
	vec3RoundToZero,
	vec3Set,
	vec3SetComponent,
	vec3SetFromColor,
	vec3SetFromCylindrical,
	vec3SetFromCylindricalCoords,
	vec3SetFromEuler,
	vec3SetFromMatrix3Column,
	vec3SetFromMatrixColumn,
	vec3SetFromMatrixPosition,
	vec3SetFromMatrixScale,
	vec3SetFromSpherical,
	vec3SetFromSphericalCoords,
	vec3SetLength,
	vec3SetScalar,
	vec3SetX,
	vec3SetY,
	vec3SetZ,
	vec3Sub,
	vec3SubScalar,
	vec3SubVectors,
	vec3ToArray,
	vec3TransformDirection,
	vec3Unproject
} from './Vector3Functions.js';

/**
 * Class representing a 3D vector. A 3D vector is an ordered triplet of numbers
 * (labeled x, y and z), which can be used to represent a number of things, such as:
 *
 * - A point in 3D space.
 * - A direction and length in 3D space. In three.js the length will
 * always be the Euclidean distance(straight-line distance) from `(0, 0, 0)` to `(x, y, z)`
 * and the direction is also measured from `(0, 0, 0)` towards `(x, y, z)`.
 * - Any arbitrary ordered triplet of numbers.
 *
 * There are other things a 3D vector can be used to represent, such as
 * momentum vectors and so on, however these are the most
 * common uses in three.js.
 *
 * Iterating through a vector instance will yield its components `(x, y, z)` in
 * the corresponding order.
 * ```js
 * const a = new THREE.Vector3( 0, 1, 0 );
 *
 * //no arguments; will be initialised to (0, 0, 0)
 * const b = new THREE.Vector3( );
 *
 * const d = a.distanceTo( b );
 * ```
 *
 * `Vector3` is a thin, backwards-compatible wrapper around the standalone,
 * tree-shakeable `vec3*` functions in {@link Vector3Functions}, which operate
 * on any {@link Vector3Like} object. Prefer importing those functions
 * directly if you only need a handful of operations and want unused ones
 * eliminated from your bundle.
 */
class Vector3 {

	/**
	 * This flag can be used for type testing.
	 *
	 * @type {boolean}
	 * @readonly
	 * @default true
	 */
	get isVector3() {

		return true;

	}

	/**
	 * Constructs a new 3D vector.
	 *
	 * @param {number} [x=0] - The x value of this vector.
	 * @param {number} [y=0] - The y value of this vector.
	 * @param {number} [z=0] - The z value of this vector.
	 */
	constructor( x = 0, y = 0, z = 0 ) {

		/**
		 * The x value of this vector.
		 *
		 * @type {number}
		 */
		this.x = x;

		/**
		 * The y value of this vector.
		 *
		 * @type {number}
		 */
		this.y = y;

		/**
		 * The z value of this vector.
		 *
		 * @type {number}
		 */
		this.z = z;

	}

	/**
	 * Sets the vector components.
	 *
	 * @param {number} x - The value of the x component.
	 * @param {number} y - The value of the y component.
	 * @param {number} z - The value of the z component.
	 * @return {Vector3} A reference to this vector.
	 */
	set( x, y, z ) {

		return vec3Set( this, x, y, z );

	}

	/**
	 * Sets the vector components to the same value.
	 *
	 * @param {number} scalar - The value to set for all vector components.
	 * @return {Vector3} A reference to this vector.
	 */
	setScalar( scalar ) {

		return vec3SetScalar( this, scalar );

	}

	/**
	 * Sets the vector's x component to the given value.
	 *
	 * @param {number} x - The value to set.
	 * @return {Vector3} A reference to this vector.
	 */
	setX( x ) {

		return vec3SetX( this, x );

	}

	/**
	 * Sets the vector's y component to the given value.
	 *
	 * @param {number} y - The value to set.
	 * @return {Vector3} A reference to this vector.
	 */
	setY( y ) {

		return vec3SetY( this, y );

	}

	/**
	 * Sets the vector's z component to the given value.
	 *
	 * @param {number} z - The value to set.
	 * @return {Vector3} A reference to this vector.
	 */
	setZ( z ) {

		return vec3SetZ( this, z );

	}

	/**
	 * Allows to set a vector component with an index.
	 *
	 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
	 * @param {number} value - The value to set.
	 * @return {Vector3} A reference to this vector.
	 */
	setComponent( index, value ) {

		return vec3SetComponent( this, index, value );

	}

	/**
	 * Returns the value of the vector component which matches the given index.
	 *
	 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
	 * @return {number} A vector component value.
	 */
	getComponent( index ) {

		return vec3GetComponent( this, index );

	}

	/**
	 * Returns a new vector with copied values from this instance.
	 *
	 * @return {Vector3} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.x, this.y, this.z );

	}

	/**
	 * Copies the values of the given vector to this instance.
	 *
	 * @param {Vector3} v - The vector to copy.
	 * @return {Vector3} A reference to this vector.
	 */
	copy( v ) {

		return vec3Copy( v, this );

	}

	/**
	 * Adds the given vector to this instance.
	 *
	 * @param {Vector3} v - The vector to add.
	 * @return {Vector3} A reference to this vector.
	 */
	add( v ) {

		return vec3Add( this, v, this );

	}

	/**
	 * Adds the given scalar value to all components of this instance.
	 *
	 * @param {number} s - The scalar to add.
	 * @return {Vector3} A reference to this vector.
	 */
	addScalar( s ) {

		return vec3AddScalar( this, s, this );

	}

	/**
	 * Adds the given vectors and stores the result in this instance.
	 *
	 * @param {Vector3} a - The first vector.
	 * @param {Vector3} b - The second vector.
	 * @return {Vector3} A reference to this vector.
	 */
	addVectors( a, b ) {

		return vec3AddVectors( a, b, this );

	}

	/**
	 * Adds the given vector scaled by the given factor to this instance.
	 *
	 * @param {Vector3|Vector4} v - The vector.
	 * @param {number} s - The factor that scales `v`.
	 * @return {Vector3} A reference to this vector.
	 */
	addScaledVector( v, s ) {

		return vec3AddScaledVector( this, v, s, this );

	}

	/**
	 * Subtracts the given vector from this instance.
	 *
	 * @param {Vector3} v - The vector to subtract.
	 * @return {Vector3} A reference to this vector.
	 */
	sub( v ) {

		return vec3Sub( this, v, this );

	}

	/**
	 * Subtracts the given scalar value from all components of this instance.
	 *
	 * @param {number} s - The scalar to subtract.
	 * @return {Vector3} A reference to this vector.
	 */
	subScalar( s ) {

		return vec3SubScalar( this, s, this );

	}

	/**
	 * Subtracts the given vectors and stores the result in this instance.
	 *
	 * @param {Vector3} a - The first vector.
	 * @param {Vector3} b - The second vector.
	 * @return {Vector3} A reference to this vector.
	 */
	subVectors( a, b ) {

		return vec3SubVectors( a, b, this );

	}

	/**
	 * Multiplies the given vector with this instance.
	 *
	 * @param {Vector3} v - The vector to multiply.
	 * @return {Vector3} A reference to this vector.
	 */
	multiply( v ) {

		return vec3Multiply( this, v, this );

	}

	/**
	 * Multiplies the given scalar value with all components of this instance.
	 *
	 * @param {number} scalar - The scalar to multiply.
	 * @return {Vector3} A reference to this vector.
	 */
	multiplyScalar( scalar ) {

		return vec3MultiplyScalar( this, scalar, this );

	}

	/**
	 * Multiplies the given vectors and stores the result in this instance.
	 *
	 * @param {Vector3} a - The first vector.
	 * @param {Vector3} b - The second vector.
	 * @return {Vector3} A reference to this vector.
	 */
	multiplyVectors( a, b ) {

		return vec3MultiplyVectors( a, b, this );

	}

	/**
	 * Applies the given Euler rotation to this vector.
	 *
	 * @param {Euler} euler - The Euler angles.
	 * @return {Vector3} A reference to this vector.
	 */
	applyEuler( euler ) {

		return vec3ApplyEuler( this, euler, this );

	}

	/**
	 * Applies a rotation specified by an axis and an angle to this vector.
	 *
	 * @param {Vector3} axis - A normalized vector representing the rotation axis.
	 * @param {number} angle - The angle in radians.
	 * @return {Vector3} A reference to this vector.
	 */
	applyAxisAngle( axis, angle ) {

		return vec3ApplyAxisAngle( this, axis, angle, this );

	}

	/**
	 * Multiplies this vector with the given 3x3 matrix.
	 *
	 * @param {Matrix3} m - The 3x3 matrix.
	 * @return {Vector3} A reference to this vector.
	 */
	applyMatrix3( m ) {

		return vec3ApplyMatrix3( this, m, this );

	}

	/**
	 * Multiplies this vector by the given normal matrix and normalizes
	 * the result.
	 *
	 * @param {Matrix3} m - The normal matrix.
	 * @return {Vector3} A reference to this vector.
	 */
	applyNormalMatrix( m ) {

		return vec3ApplyNormalMatrix( this, m, this );

	}

	/**
	 * Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
	 * divides by perspective.
	 *
	 * @param {Matrix4} m - The matrix to apply.
	 * @return {Vector3} A reference to this vector.
	 */
	applyMatrix4( m ) {

		return vec3ApplyMatrix4( this, m, this );

	}

	/**
	 * Applies the given Quaternion to this vector.
	 *
	 * @param {Quaternion} q - The Quaternion.
	 * @return {Vector3} A reference to this vector.
	 */
	applyQuaternion( q ) {

		return vec3ApplyQuaternion( this, q, this );

	}

	/**
	 * Projects this vector from world space into the camera's normalized
	 * device coordinate (NDC) space.
	 *
	 * @param {Camera} camera - The camera.
	 * @return {Vector3} A reference to this vector.
	 */
	project( camera ) {

		return vec3Project( this, camera, this );

	}

	/**
	 * Unprojects this vector from the camera's normalized device coordinate (NDC)
	 * space into world space.
	 *
	 * @param {Camera} camera - The camera.
	 * @return {Vector3} A reference to this vector.
	 */
	unproject( camera ) {

		return vec3Unproject( this, camera, this );

	}

	/**
	 * Transforms this vector by the upper left 3x3 sub-matrix of the given 4x4 matrix,
	 * and normalizes the result.
	 *
	 * @param {Matrix4} m - The matrix.
	 * @return {Vector3} A reference to this vector.
	 */
	transformDirection( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		return vec3TransformDirection( this, m, this );

	}

	/**
	 * Divides this instance by the given vector.
	 *
	 * @param {Vector3} v - The vector to divide.
	 * @return {Vector3} A reference to this vector.
	 */
	divide( v ) {

		return vec3Divide( this, v, this );

	}

	/**
	 * Divides this vector by the given scalar.
	 *
	 * @param {number} scalar - The scalar to divide.
	 * @return {Vector3} A reference to this vector.
	 */
	divideScalar( scalar ) {

		return vec3DivideScalar( this, scalar, this );

	}

	/**
	 * If this vector's x, y or z value is greater than the given vector's x, y or z
	 * value, replace that value with the corresponding min value.
	 *
	 * @param {Vector3} v - The vector.
	 * @return {Vector3} A reference to this vector.
	 */
	min( v ) {

		return vec3Min( this, v, this );

	}

	/**
	 * If this vector's x, y or z value is less than the given vector's x, y or z
	 * value, replace that value with the corresponding max value.
	 *
	 * @param {Vector3} v - The vector.
	 * @return {Vector3} A reference to this vector.
	 */
	max( v ) {

		return vec3Max( this, v, this );

	}

	/**
	 * If this vector's x, y or z value is greater than the max vector's x, y or z
	 * value, it is replaced by the corresponding value.
	 * If this vector's x, y or z value is less than the min vector's x, y or z value,
	 * it is replaced by the corresponding value.
	 *
	 * @param {Vector3} min - The minimum x, y and z values.
	 * @param {Vector3} max - The maximum x, y and z values in the desired range.
	 * @return {Vector3} A reference to this vector.
	 */
	clamp( min, max ) {

		// assumes min < max, componentwise

		return vec3Clamp( this, min, max, this );

	}

	/**
	 * If this vector's x, y or z values are greater than the max value, they are
	 * replaced by the max value.
	 * If this vector's x, y or z values are less than the min value, they are
	 * replaced by the min value.
	 *
	 * @param {number} minVal - The minimum value the components will be clamped to.
	 * @param {number} maxVal - The maximum value the components will be clamped to.
	 * @return {Vector3} A reference to this vector.
	 */
	clampScalar( minVal, maxVal ) {

		return vec3ClampScalar( this, minVal, maxVal, this );

	}

	/**
	 * If this vector's length is greater than the max value, it is replaced by
	 * the max value.
	 * If this vector's length is less than the min value, it is replaced by the
	 * min value.
	 *
	 * @param {number} min - The minimum value the vector length will be clamped to.
	 * @param {number} max - The maximum value the vector length will be clamped to.
	 * @return {Vector3} A reference to this vector.
	 */
	clampLength( min, max ) {

		return vec3ClampLength( this, min, max, this );

	}

	/**
	 * The components of this vector are rounded down to the nearest integer value.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	floor() {

		return vec3Floor( this, this );

	}

	/**
	 * The components of this vector are rounded up to the nearest integer value.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	ceil() {

		return vec3Ceil( this, this );

	}

	/**
	 * The components of this vector are rounded to the nearest integer value
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	round() {

		return vec3Round( this, this );

	}

	/**
	 * The components of this vector are rounded towards zero (up if negative,
	 * down if positive) to an integer value.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	roundToZero() {

		return vec3RoundToZero( this, this );

	}

	/**
	 * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	negate() {

		return vec3Negate( this, this );

	}

	/**
	 * Calculates the dot product of the given vector with this instance.
	 *
	 * @param {Vector3} v - The vector to compute the dot product with.
	 * @return {number} The result of the dot product.
	 */
	dot( v ) {

		return vec3Dot( this, v );

	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from
	 * (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should
	 * compare the length squared instead as it is slightly more efficient to calculate.
	 *
	 * @return {number} The square length of this vector.
	 */
	lengthSq() {

		return vec3LengthSq( this );

	}

	/**
	 * Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
	 *
	 * @return {number} The length of this vector.
	 */
	length() {

		return vec3Length( this );

	}

	/**
	 * Computes the Manhattan length of this vector.
	 *
	 * @return {number} The length of this vector.
	 */
	manhattanLength() {

		return vec3ManhattanLength( this );

	}

	/**
	 * Converts this vector to a unit vector - that is, sets it equal to a vector
	 * with the same direction as this one, but with a vector length of `1`.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	normalize() {

		return vec3Normalize( this, this );

	}

	/**
	 * Sets this vector to a vector with the same direction as this one, but
	 * with the specified length.
	 *
	 * @param {number} length - The new length of this vector.
	 * @return {Vector3} A reference to this vector.
	 */
	setLength( length ) {

		return vec3SetLength( this, length, this );

	}

	/**
	 * Linearly interpolates between the given vector and this instance, where
	 * alpha is the percent distance along the line - alpha = 0 will be this
	 * vector, and alpha = 1 will be the given one.
	 *
	 * @param {Vector3} v - The vector to interpolate towards.
	 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	 * @return {Vector3} A reference to this vector.
	 */
	lerp( v, alpha ) {

		return vec3Lerp( this, v, alpha, this );

	}

	/**
	 * Linearly interpolates between the given vectors, where alpha is the percent
	 * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
	 * be the second one. The result is stored in this instance.
	 *
	 * @param {Vector3} v1 - The first vector.
	 * @param {Vector3} v2 - The second vector.
	 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	 * @return {Vector3} A reference to this vector.
	 */
	lerpVectors( v1, v2, alpha ) {

		return vec3LerpVectors( v1, v2, alpha, this );

	}

	/**
	 * Calculates the cross product of the given vector with this instance.
	 *
	 * @param {Vector3} v - The vector to compute the cross product with.
	 * @return {Vector3} The result of the cross product.
	 */
	cross( v ) {

		return vec3Cross( this, v, this );

	}

	/**
	 * Calculates the cross product of the given vectors and stores the result
	 * in this instance.
	 *
	 * @param {Vector3} a - The first vector.
	 * @param {Vector3} b - The second vector.
	 * @return {Vector3} A reference to this vector.
	 */
	crossVectors( a, b ) {

		return vec3CrossVectors( a, b, this );

	}

	/**
	 * Projects this vector onto the given one.
	 *
	 * @param {Vector3} v - The vector to project to.
	 * @return {Vector3} A reference to this vector.
	 */
	projectOnVector( v ) {

		return vec3ProjectOnVector( this, v, this );

	}

	/**
	 * Projects this vector onto a plane by subtracting this
	 * vector projected onto the plane's normal from this vector.
	 *
	 * @param {Vector3} planeNormal - The plane normal.
	 * @return {Vector3} A reference to this vector.
	 */
	projectOnPlane( planeNormal ) {

		return vec3ProjectOnPlane( this, planeNormal, this );

	}

	/**
	 * Reflects this vector off a plane orthogonal to the given normal vector.
	 *
	 * @param {Vector3} normal - The (normalized) normal vector.
	 * @return {Vector3} A reference to this vector.
	 */
	reflect( normal ) {

		return vec3Reflect( this, normal, this );

	}
	/**
	 * Returns the angle between the given vector and this instance in radians.
	 *
	 * @param {Vector3} v - The vector to compute the angle with.
	 * @return {number} The angle in radians.
	 */
	angleTo( v ) {

		return vec3AngleTo( this, v );

	}

	/**
	 * Computes the distance from the given vector to this instance.
	 *
	 * @param {Vector3} v - The vector to compute the distance to.
	 * @return {number} The distance.
	 */
	distanceTo( v ) {

		return vec3DistanceTo( this, v );

	}

	/**
	 * Computes the squared distance from the given vector to this instance.
	 * If you are just comparing the distance with another distance, you should compare
	 * the distance squared instead as it is slightly more efficient to calculate.
	 *
	 * @param {Vector3} v - The vector to compute the squared distance to.
	 * @return {number} The squared distance.
	 */
	distanceToSquared( v ) {

		return vec3DistanceToSquared( this, v );

	}

	/**
	 * Computes the Manhattan distance from the given vector to this instance.
	 *
	 * @param {Vector3} v - The vector to compute the Manhattan distance to.
	 * @return {number} The Manhattan distance.
	 */
	manhattanDistanceTo( v ) {

		return vec3ManhattanDistanceTo( this, v );

	}

	/**
	 * Sets the vector components from the given spherical coordinates.
	 *
	 * @param {Spherical} s - The spherical coordinates.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromSpherical( s ) {

		return vec3SetFromSpherical( s, this );

	}

	/**
	 * Sets the vector components from the given spherical coordinates.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} phi - The phi angle in radians.
	 * @param {number} theta - The theta angle in radians.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromSphericalCoords( radius, phi, theta ) {

		return vec3SetFromSphericalCoords( radius, phi, theta, this );

	}

	/**
	 * Sets the vector components from the given cylindrical coordinates.
	 *
	 * @param {Cylindrical} c - The cylindrical coordinates.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromCylindrical( c ) {

		return vec3SetFromCylindrical( c, this );

	}

	/**
	 * Sets the vector components from the given cylindrical coordinates.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} theta - The theta angle in radians.
	 * @param {number} y - The y value.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromCylindricalCoords( radius, theta, y ) {

		return vec3SetFromCylindricalCoords( radius, theta, y, this );

	}

	/**
	 * Sets the vector components to the position elements of the
	 * given transformation matrix.
	 *
	 * @param {Matrix4} m - The 4x4 matrix.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromMatrixPosition( m ) {

		return vec3SetFromMatrixPosition( m, this );

	}

	/**
	 * Sets the vector components to the scale elements of the
	 * given transformation matrix.
	 *
	 * @param {Matrix4} m - The 4x4 matrix.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromMatrixScale( m ) {

		return vec3SetFromMatrixScale( m, this );

	}

	/**
	 * Sets the vector components from the specified matrix column.
	 *
	 * @param {Matrix4} m - The 4x4 matrix.
	 * @param {number} index - The column index.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromMatrixColumn( m, index ) {

		return vec3SetFromMatrixColumn( m, index, this );

	}

	/**
	 * Sets the vector components from the specified matrix column.
	 *
	 * @param {Matrix3} m - The 3x3 matrix.
	 * @param {number} index - The column index.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromMatrix3Column( m, index ) {

		return vec3SetFromMatrix3Column( m, index, this );

	}

	/**
	 * Sets the vector components from the given Euler angles.
	 *
	 * @param {Euler} e - The Euler angles to set.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromEuler( e ) {

		return vec3SetFromEuler( e, this );

	}

	/**
	 * Sets the vector components from the RGB components of the
	 * given color.
	 *
	 * @param {Color} c - The color to set.
	 * @return {Vector3} A reference to this vector.
	 */
	setFromColor( c ) {

		return vec3SetFromColor( c, this );

	}

	/**
	 * Returns `true` if this vector is equal with the given one.
	 *
	 * @param {Vector3} v - The vector to test for equality.
	 * @return {boolean} Whether this vector is equal with the given one.
	 */
	equals( v ) {

		return vec3Equals( this, v );

	}

	/**
	 * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
	 * and z value to be `array[ offset + 2 ]`.
	 *
	 * @param {Array<number>} array - An array holding the vector component values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @return {Vector3} A reference to this vector.
	 */
	fromArray( array, offset = 0 ) {

		return vec3FromArray( array, offset, this );

	}

	/**
	 * Writes the components of this vector to the given array. If no array is provided,
	 * the method returns a new instance.
	 *
	 * @param {Array<number>} [array=[]] - The target array holding the vector components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @return {Array<number>} The vector components.
	 */
	toArray( array = [], offset = 0 ) {

		return vec3ToArray( this, array, offset );

	}

	/**
	 * Sets the components of this vector from the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
	 * @param {number} index - The index into the attribute.
	 * @return {Vector3} A reference to this vector.
	 */
	fromBufferAttribute( attribute, index ) {

		return vec3FromBufferAttribute( attribute, index, this );

	}

	/**
	 * Sets each component of this vector to a pseudo-random value between `0` and
	 * `1`, excluding `1`.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	random() {

		return vec3Random( this );

	}

	/**
	 * Sets this vector to a uniformly random point on a unit sphere.
	 *
	 * @return {Vector3} A reference to this vector.
	 */
	randomDirection() {

		return vec3RandomDirection( this );

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}

}

export { Vector3 };
