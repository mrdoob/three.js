# Quaternion

Class for representing a Quaternion. Quaternions are used in three.js to represent rotations.

Iterating through a vector instance will yield its components `(x, y, z, w)` in the corresponding order.

Note that three.js expects Quaternions to be normalized.

## Code Example

```js
const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
const vector = new THREE.Vector3( 1, 0, 0 );
vector.applyQuaternion( quaternion );
```

## Constructor

### new Quaternion( x : number, y : number, z : number, w : number )

Constructs a new quaternion.

**x**

The x value of this quaternion.

Default is `0`.

**y**

The y value of this quaternion.

Default is `0`.

**z**

The z value of this quaternion.

Default is `0`.

**w**

The w value of this quaternion.

Default is `1`.

## Properties

### .isQuaternion : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .w : number

The w value of this quaternion.

Default is `1`.

### .x : number

The x value of this quaternion.

Default is `0`.

### .y : number

The y value of this quaternion.

Default is `0`.

### .z : number

The z value of this quaternion.

Default is `0`.

## Methods

### .angleTo( q : Quaternion ) : number

Returns the angle between this quaternion and the given one in radians.

**q**

The quaternion to compute the angle with.

**Returns:** The angle in radians.

### .clone() : Quaternion

Returns a new quaternion with copied values from this instance.

**Returns:** A clone of this instance.

### .conjugate() : Quaternion

Returns the rotational conjugate of this quaternion. The conjugate of a quaternion represents the same rotation in the opposite direction about the rotational axis.

**Returns:** A reference to this quaternion.

### .copy( quaternion : Quaternion ) : Quaternion

Copies the values of the given quaternion to this instance.

**quaternion**

The quaternion to copy.

**Returns:** A reference to this quaternion.

### .dot( v : Quaternion ) : number

Calculates the dot product of this quaternion and the given one.

**v**

The quaternion to compute the dot product with.

**Returns:** The result of the dot product.

### .equals( quaternion : Quaternion ) : boolean

Returns `true` if this quaternion is equal with the given one.

**quaternion**

The quaternion to test for equality.

**Returns:** Whether this quaternion is equal with the given one.

### .fromArray( array : Array.<number>, offset : number ) : Quaternion

Sets this quaternion's components from the given array.

**array**

An array holding the quaternion component values.

**offset**

The offset into the array.

Default is `0`.

**Returns:** A reference to this quaternion.

### .fromBufferAttribute( attribute : BufferAttribute, index : number ) : Quaternion

Sets the components of this quaternion from the given buffer attribute.

**attribute**

The buffer attribute holding quaternion data.

**index**

The index into the attribute.

**Returns:** A reference to this quaternion.

### .identity() : Quaternion

Sets this quaternion to the identity quaternion; that is, to the quaternion that represents "no rotation".

**Returns:** A reference to this quaternion.

### .invert() : Quaternion

Inverts this quaternion via [Quaternion#conjugate](Quaternion.html#conjugate). The quaternion is assumed to have unit length.

**Returns:** A reference to this quaternion.

### .length() : number

Computes the Euclidean length (straight-line length) of this quaternion, considered as a 4 dimensional vector.

**Returns:** The Euclidean length.

### .lengthSq() : number

Computes the squared Euclidean length (straight-line length) of this quaternion, considered as a 4 dimensional vector. This can be useful if you are comparing the lengths of two quaternions, as this is a slightly more efficient calculation than [Quaternion#length](Quaternion.html#length).

**Returns:** The squared Euclidean length.

### .multiply( q : Quaternion ) : Quaternion

Multiplies this quaternion by the given one.

**q**

The quaternion.

**Returns:** A reference to this quaternion.

### .multiplyQuaternions( a : Quaternion, b : Quaternion ) : Quaternion

Multiplies the given quaternions and stores the result in this instance.

**a**

The first quaternion.

**b**

The second quaternion.

**Returns:** A reference to this quaternion.

### .normalize() : Quaternion

Normalizes this quaternion - that is, calculated the quaternion that performs the same rotation as this one, but has a length equal to `1`.

**Returns:** A reference to this quaternion.

### .premultiply( q : Quaternion ) : Quaternion

Pre-multiplies this quaternion by the given one.

**q**

The quaternion.

**Returns:** A reference to this quaternion.

### .random() : Quaternion

Sets this quaternion to a uniformly random, normalized quaternion.

**Returns:** A reference to this quaternion.

### .rotateTowards( q : Quaternion, step : number ) : Quaternion

Rotates this quaternion by a given angular step to the given quaternion. The method ensures that the final quaternion will not overshoot `q`.

**q**

The target quaternion.

**step**

The angular step in radians.

**Returns:** A reference to this quaternion.

### .set( x : number, y : number, z : number, w : number ) : Quaternion

Sets the quaternion components.

**x**

The x value of this quaternion.

**y**

The y value of this quaternion.

**z**

The z value of this quaternion.

**w**

The w value of this quaternion.

**Returns:** A reference to this quaternion.

### .setFromAxisAngle( axis : Vector3, angle : number ) : Quaternion

Sets this quaternion from the given axis and angle.

**axis**

The normalized axis.

**angle**

The angle in radians.

**Returns:** A reference to this quaternion.

### .setFromEuler( euler : Euler, update : boolean ) : Quaternion

Sets this quaternion from the rotation specified by the given Euler angles.

**euler**

The Euler angles.

**update**

Whether the internal `onChange` callback should be executed or not.

Default is `true`.

**Returns:** A reference to this quaternion.

### .setFromRotationMatrix( m : Matrix4 ) : Quaternion

Sets this quaternion from the given rotation matrix.

**m**

A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).

**Returns:** A reference to this quaternion.

### .setFromUnitVectors( vFrom : Vector3, vTo : Vector3 ) : Quaternion

Sets this quaternion to the rotation required to rotate the direction vector `vFrom` to the direction vector `vTo`.

**vFrom**

The first (normalized) direction vector.

**vTo**

The second (normalized) direction vector.

**Returns:** A reference to this quaternion.

### .slerp( qb : Quaternion, t : number ) : Quaternion

Performs a spherical linear interpolation between this quaternion and the target quaternion.

**qb**

The target quaternion.

**t**

The interpolation factor. A value in the range `[0,1]` will interpolate. A value outside the range `[0,1]` will extrapolate.

**Returns:** A reference to this quaternion.

### .slerpQuaternions( qa : Quaternion, qb : Quaternion, t : number ) : Quaternion

Performs a spherical linear interpolation between the given quaternions and stores the result in this quaternion.

**qa**

The source quaternion.

**qb**

The target quaternion.

**t**

The interpolation factor in the closed interval `[0, 1]`.

**Returns:** A reference to this quaternion.

### .toArray( array : Array.<number>, offset : number ) : Array.<number>

Writes the components of this quaternion to the given array. If no array is provided, the method returns a new instance.

**array**

The target array holding the quaternion components.

Default is `[]`.

**offset**

Index of the first element in the array.

Default is `0`.

**Returns:** The quaternion components.

### .toJSON() : Array.<number>

This methods defines the serialization result of this class. Returns the numerical elements of this quaternion in an array of format `[x, y, z, w]`.

**Returns:** The serialized quaternion.

## Static Methods

### .multiplyQuaternionsFlat( dst : Array.<number>, dstOffset : number, src0 : Array.<number>, srcOffset0 : number, src1 : Array.<number>, srcOffset1 : number ) : Array.<number>

Multiplies two quaternions. This implementation assumes the quaternion data are managed in flat arrays.

**dst**

The destination array.

**dstOffset**

An offset into the destination array.

**src0**

The source array of the first quaternion.

**srcOffset0**

An offset into the first source array.

**src1**

The source array of the second quaternion.

**srcOffset1**

An offset into the second source array.

See:

*   [Quaternion#multiplyQuaternions](Quaternion.html#multiplyQuaternions).

**Returns:** The destination array.

### .slerpFlat( dst : Array.<number>, dstOffset : number, src0 : Array.<number>, srcOffset0 : number, src1 : Array.<number>, srcOffset1 : number, t : number )

Interpolates between two quaternions via SLERP. This implementation assumes the quaternion data are managed in flat arrays.

**dst**

The destination array.

**dstOffset**

An offset into the destination array.

**src0**

The source array of the first quaternion.

**srcOffset0**

An offset into the first source array.

**src1**

The source array of the second quaternion.

**srcOffset1**

An offset into the second source array.

**t**

The interpolation factor. A value in the range `[0,1]` will interpolate. A value outside the range `[0,1]` will extrapolate.

See:

*   [Quaternion#slerp](Quaternion.html#slerp)

## Source

[src/math/Quaternion.js](https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js)