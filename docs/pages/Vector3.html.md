# Vector3

Class representing a 3D vector. A 3D vector is an ordered triplet of numbers (labeled x, y and z), which can be used to represent a number of things, such as:

*   A point in 3D space.
*   A direction and length in 3D space. In three.js the length will always be the Euclidean distance(straight-line distance) from `(0, 0, 0)` to `(x, y, z)` and the direction is also measured from `(0, 0, 0)` towards `(x, y, z)`.
*   Any arbitrary ordered triplet of numbers.

There are other things a 3D vector can be used to represent, such as momentum vectors and so on, however these are the most common uses in three.js.

Iterating through a vector instance will yield its components `(x, y, z)` in the corresponding order.

## Code Example

```js
const a = new THREE.Vector3( 0, 1, 0 );
//no arguments; will be initialised to (0, 0, 0)
const b = new THREE.Vector3( );
const d = a.distanceTo( b );
```

## Constructor

### new Vector3( x : number, y : number, z : number )

Constructs a new 3D vector.

**x**

The x value of this vector.

Default is `0`.

**y**

The y value of this vector.

Default is `0`.

**z**

The z value of this vector.

Default is `0`.

## Properties

### .isVector3 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .x : number

The x value of this vector.

### .y : number

The y value of this vector.

### .z : number

The z value of this vector.

## Methods

### .add( v : Vector3 ) : Vector3

Adds the given vector to this instance.

**v**

The vector to add.

**Returns:** A reference to this vector.

### .addScalar( s : number ) : Vector3

Adds the given scalar value to all components of this instance.

**s**

The scalar to add.

**Returns:** A reference to this vector.

### .addScaledVector( v : Vector3 | Vector4, s : number ) : Vector3

Adds the given vector scaled by the given factor to this instance.

**v**

The vector.

**s**

The factor that scales `v`.

**Returns:** A reference to this vector.

### .addVectors( a : Vector3, b : Vector3 ) : Vector3

Adds the given vectors and stores the result in this instance.

**a**

The first vector.

**b**

The second vector.

**Returns:** A reference to this vector.

### .angleTo( v : Vector3 ) : number

Returns the angle between the given vector and this instance in radians.

**v**

The vector to compute the angle with.

**Returns:** The angle in radians.

### .applyAxisAngle( axis : Vector3, angle : number ) : Vector3

Applies a rotation specified by an axis and an angle to this vector.

**axis**

A normalized vector representing the rotation axis.

**angle**

The angle in radians.

**Returns:** A reference to this vector.

### .applyEuler( euler : Euler ) : Vector3

Applies the given Euler rotation to this vector.

**euler**

The Euler angles.

**Returns:** A reference to this vector.

### .applyMatrix3( m : Matrix3 ) : Vector3

Multiplies this vector with the given 3x3 matrix.

**m**

The 3x3 matrix.

**Returns:** A reference to this vector.

### .applyMatrix4( m : Matrix4 ) : Vector3

Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and divides by perspective.

**m**

The matrix to apply.

**Returns:** A reference to this vector.

### .applyNormalMatrix( m : Matrix3 ) : Vector3

Multiplies this vector by the given normal matrix and normalizes the result.

**m**

The normal matrix.

**Returns:** A reference to this vector.

### .applyQuaternion( q : Quaternion ) : Vector3

Applies the given Quaternion to this vector.

**q**

The Quaternion.

**Returns:** A reference to this vector.

### .ceil() : Vector3

The components of this vector are rounded up to the nearest integer value.

**Returns:** A reference to this vector.

### .clamp( min : Vector3, max : Vector3 ) : Vector3

If this vector's x, y or z value is greater than the max vector's x, y or z value, it is replaced by the corresponding value. If this vector's x, y or z value is less than the min vector's x, y or z value, it is replaced by the corresponding value.

**min**

The minimum x, y and z values.

**max**

The maximum x, y and z values in the desired range.

**Returns:** A reference to this vector.

### .clampLength( min : number, max : number ) : Vector3

If this vector's length is greater than the max value, it is replaced by the max value. If this vector's length is less than the min value, it is replaced by the min value.

**min**

The minimum value the vector length will be clamped to.

**max**

The maximum value the vector length will be clamped to.

**Returns:** A reference to this vector.

### .clampScalar( minVal : number, maxVal : number ) : Vector3

If this vector's x, y or z values are greater than the max value, they are replaced by the max value. If this vector's x, y or z values are less than the min value, they are replaced by the min value.

**minVal**

The minimum value the components will be clamped to.

**maxVal**

The maximum value the components will be clamped to.

**Returns:** A reference to this vector.

### .clone() : Vector3

Returns a new vector with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( v : Vector3 ) : Vector3

Copies the values of the given vector to this instance.

**v**

The vector to copy.

**Returns:** A reference to this vector.

### .cross( v : Vector3 ) : Vector3

Calculates the cross product of the given vector with this instance.

**v**

The vector to compute the cross product with.

**Returns:** The result of the cross product.

### .crossVectors( a : Vector3, b : Vector3 ) : Vector3

Calculates the cross product of the given vectors and stores the result in this instance.

**a**

The first vector.

**b**

The second vector.

**Returns:** A reference to this vector.

### .distanceTo( v : Vector3 ) : number

Computes the distance from the given vector to this instance.

**v**

The vector to compute the distance to.

**Returns:** The distance.

### .distanceToSquared( v : Vector3 ) : number

Computes the squared distance from the given vector to this instance. If you are just comparing the distance with another distance, you should compare the distance squared instead as it is slightly more efficient to calculate.

**v**

The vector to compute the squared distance to.

**Returns:** The squared distance.

### .divide( v : Vector3 ) : Vector3

Divides this instance by the given vector.

**v**

The vector to divide.

**Returns:** A reference to this vector.

### .divideScalar( scalar : number ) : Vector3

Divides this vector by the given scalar.

**scalar**

The scalar to divide.

**Returns:** A reference to this vector.

### .dot( v : Vector3 ) : number

Calculates the dot product of the given vector with this instance.

**v**

The vector to compute the dot product with.

**Returns:** The result of the dot product.

### .equals( v : Vector3 ) : boolean

Returns `true` if this vector is equal with the given one.

**v**

The vector to test for equality.

**Returns:** Whether this vector is equal with the given one.

### .floor() : Vector3

The components of this vector are rounded down to the nearest integer value.

**Returns:** A reference to this vector.

### .fromArray( array : Array.<number>, offset : number ) : Vector3

Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]` and z value to be `array[ offset + 2 ]`.

**array**

An array holding the vector component values.

**offset**

The offset into the array.

Default is `0`.

**Returns:** A reference to this vector.

### .fromBufferAttribute( attribute : BufferAttribute, index : number ) : Vector3

Sets the components of this vector from the given buffer attribute.

**attribute**

The buffer attribute holding vector data.

**index**

The index into the attribute.

**Returns:** A reference to this vector.

### .getComponent( index : number ) : number

Returns the value of the vector component which matches the given index.

**index**

The component index. `0` equals to x, `1` equals to y, `2` equals to z.

**Returns:** A vector component value.

### .length() : number

Computes the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).

**Returns:** The length of this vector.

### .lengthSq() : number

Computes the square of the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should compare the length squared instead as it is slightly more efficient to calculate.

**Returns:** The square length of this vector.

### .lerp( v : Vector3, alpha : number ) : Vector3

Linearly interpolates between the given vector and this instance, where alpha is the percent distance along the line - alpha = 0 will be this vector, and alpha = 1 will be the given one.

**v**

The vector to interpolate towards.

**alpha**

The interpolation factor, typically in the closed interval `[0, 1]`.

**Returns:** A reference to this vector.

### .lerpVectors( v1 : Vector3, v2 : Vector3, alpha : number ) : Vector3

Linearly interpolates between the given vectors, where alpha is the percent distance along the line - alpha = 0 will be first vector, and alpha = 1 will be the second one. The result is stored in this instance.

**v1**

The first vector.

**v2**

The second vector.

**alpha**

The interpolation factor, typically in the closed interval `[0, 1]`.

**Returns:** A reference to this vector.

### .manhattanDistanceTo( v : Vector3 ) : number

Computes the Manhattan distance from the given vector to this instance.

**v**

The vector to compute the Manhattan distance to.

**Returns:** The Manhattan distance.

### .manhattanLength() : number

Computes the Manhattan length of this vector.

**Returns:** The length of this vector.

### .max( v : Vector3 ) : Vector3

If this vector's x, y or z value is less than the given vector's x, y or z value, replace that value with the corresponding max value.

**v**

The vector.

**Returns:** A reference to this vector.

### .min( v : Vector3 ) : Vector3

If this vector's x, y or z value is greater than the given vector's x, y or z value, replace that value with the corresponding min value.

**v**

The vector.

**Returns:** A reference to this vector.

### .multiply( v : Vector3 ) : Vector3

Multiplies the given vector with this instance.

**v**

The vector to multiply.

**Returns:** A reference to this vector.

### .multiplyScalar( scalar : number ) : Vector3

Multiplies the given scalar value with all components of this instance.

**scalar**

The scalar to multiply.

**Returns:** A reference to this vector.

### .multiplyVectors( a : Vector3, b : Vector3 ) : Vector3

Multiplies the given vectors and stores the result in this instance.

**a**

The first vector.

**b**

The second vector.

**Returns:** A reference to this vector.

### .negate() : Vector3

Inverts this vector - i.e. sets x = -x, y = -y and z = -z.

**Returns:** A reference to this vector.

### .normalize() : Vector3

Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but with a vector length of `1`.

**Returns:** A reference to this vector.

### .project( camera : Camera ) : Vector3

Projects this vector from world space into the camera's normalized device coordinate (NDC) space.

**camera**

The camera.

**Returns:** A reference to this vector.

### .projectOnPlane( planeNormal : Vector3 ) : Vector3

Projects this vector onto a plane by subtracting this vector projected onto the plane's normal from this vector.

**planeNormal**

The plane normal.

**Returns:** A reference to this vector.

### .projectOnVector( v : Vector3 ) : Vector3

Projects this vector onto the given one.

**v**

The vector to project to.

**Returns:** A reference to this vector.

### .random() : Vector3

Sets each component of this vector to a pseudo-random value between `0` and `1`, excluding `1`.

**Returns:** A reference to this vector.

### .randomDirection() : Vector3

Sets this vector to a uniformly random point on a unit sphere.

**Returns:** A reference to this vector.

### .reflect( normal : Vector3 ) : Vector3

Reflects this vector off a plane orthogonal to the given normal vector.

**normal**

The (normalized) normal vector.

**Returns:** A reference to this vector.

### .round() : Vector3

The components of this vector are rounded to the nearest integer value

**Returns:** A reference to this vector.

### .roundToZero() : Vector3

The components of this vector are rounded towards zero (up if negative, down if positive) to an integer value.

**Returns:** A reference to this vector.

### .set( x : number, y : number, z : number ) : Vector3

Sets the vector components.

**x**

The value of the x component.

**y**

The value of the y component.

**z**

The value of the z component.

**Returns:** A reference to this vector.

### .setComponent( index : number, value : number ) : Vector3

Allows to set a vector component with an index.

**index**

The component index. `0` equals to x, `1` equals to y, `2` equals to z.

**value**

The value to set.

**Returns:** A reference to this vector.

### .setFromColor( c : Color ) : Vector3

Sets the vector components from the RGB components of the given color.

**c**

The color to set.

**Returns:** A reference to this vector.

### .setFromCylindrical( c : Cylindrical ) : Vector3

Sets the vector components from the given cylindrical coordinates.

**c**

The cylindrical coordinates.

**Returns:** A reference to this vector.

### .setFromCylindricalCoords( radius : number, theta : number, y : number ) : Vector3

Sets the vector components from the given cylindrical coordinates.

**radius**

The radius.

**theta**

The theta angle in radians.

**y**

The y value.

**Returns:** A reference to this vector.

### .setFromEuler( e : Euler ) : Vector3

Sets the vector components from the given Euler angles.

**e**

The Euler angles to set.

**Returns:** A reference to this vector.

### .setFromMatrix3Column( m : Matrix3, index : number ) : Vector3

Sets the vector components from the specified matrix column.

**m**

The 3x3 matrix.

**index**

The column index.

**Returns:** A reference to this vector.

### .setFromMatrixColumn( m : Matrix4, index : number ) : Vector3

Sets the vector components from the specified matrix column.

**m**

The 4x4 matrix.

**index**

The column index.

**Returns:** A reference to this vector.

### .setFromMatrixPosition( m : Matrix4 ) : Vector3

Sets the vector components to the position elements of the given transformation matrix.

**m**

The 4x4 matrix.

**Returns:** A reference to this vector.

### .setFromMatrixScale( m : Matrix4 ) : Vector3

Sets the vector components to the scale elements of the given transformation matrix.

**m**

The 4x4 matrix.

**Returns:** A reference to this vector.

### .setFromSpherical( s : Spherical ) : Vector3

Sets the vector components from the given spherical coordinates.

**s**

The spherical coordinates.

**Returns:** A reference to this vector.

### .setFromSphericalCoords( radius : number, phi : number, theta : number ) : Vector3

Sets the vector components from the given spherical coordinates.

**radius**

The radius.

**phi**

The phi angle in radians.

**theta**

The theta angle in radians.

**Returns:** A reference to this vector.

### .setLength( length : number ) : Vector3

Sets this vector to a vector with the same direction as this one, but with the specified length.

**length**

The new length of this vector.

**Returns:** A reference to this vector.

### .setScalar( scalar : number ) : Vector3

Sets the vector components to the same value.

**scalar**

The value to set for all vector components.

**Returns:** A reference to this vector.

### .setX( x : number ) : Vector3

Sets the vector's x component to the given value

**x**

The value to set.

**Returns:** A reference to this vector.

### .setY( y : number ) : Vector3

Sets the vector's y component to the given value

**y**

The value to set.

**Returns:** A reference to this vector.

### .setZ( z : number ) : Vector3

Sets the vector's z component to the given value

**z**

The value to set.

**Returns:** A reference to this vector.

### .sub( v : Vector3 ) : Vector3

Subtracts the given vector from this instance.

**v**

The vector to subtract.

**Returns:** A reference to this vector.

### .subScalar( s : number ) : Vector3

Subtracts the given scalar value from all components of this instance.

**s**

The scalar to subtract.

**Returns:** A reference to this vector.

### .subVectors( a : Vector3, b : Vector3 ) : Vector3

Subtracts the given vectors and stores the result in this instance.

**a**

The first vector.

**b**

The second vector.

**Returns:** A reference to this vector.

### .toArray( array : Array.<number>, offset : number ) : Array.<number>

Writes the components of this vector to the given array. If no array is provided, the method returns a new instance.

**array**

The target array holding the vector components.

Default is `[]`.

**offset**

Index of the first element in the array.

Default is `0`.

**Returns:** The vector components.

### .transformDirection( m : Matrix4 ) : Vector3

Transforms the direction of this vector by a matrix (the upper left 3 x 3 subset of the given 4x4 matrix and then normalizes the result.

**m**

The matrix.

**Returns:** A reference to this vector.

### .unproject( camera : Camera ) : Vector3

Unprojects this vector from the camera's normalized device coordinate (NDC) space into world space.

**camera**

The camera.

**Returns:** A reference to this vector.

## Source

[src/math/Vector3.js](https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js)