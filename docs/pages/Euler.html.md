# Euler

A class representing Euler angles.

Euler angles describe a rotational transformation by rotating an object on its various axes in specified amounts per axis, and a specified axis order.

Iterating through an instance will yield its components (x, y, z, order) in the corresponding order.

## Code Example

```js
const a = new THREE.Euler( 0, 1, 1.57, 'XYZ' );
const b = new THREE.Vector3( 1, 0, 1 );
b.applyEuler(a);
```

## Constructor

### new Euler( x : number, y : number, z : number, order : string )

Constructs a new euler instance.

**x**

The angle of the x axis in radians.

Default is `0`.

**y**

The angle of the y axis in radians.

Default is `0`.

**z**

The angle of the z axis in radians.

Default is `0`.

**order**

A string representing the order that the rotations are applied.

Default is `Euler.DEFAULT_ORDER`.

## Properties

### .isEuler : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .order : string

A string representing the order that the rotations are applied.

Default is `'XYZ'`.

### .x : number

The angle of the x axis in radians.

Default is `0`.

### .y : number

The angle of the y axis in radians.

Default is `0`.

### .z : number

The angle of the z axis in radians.

Default is `0`.

### .DEFAULT_ORDER : string

The default Euler angle order.

Default is `'XYZ'`.

## Methods

### .clone() : Euler

Returns a new Euler instance with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( euler : Euler ) : Euler

Copies the values of the given Euler instance to this instance.

**euler**

The Euler instance to copy.

**Returns:** A reference to this Euler instance.

### .equals( euler : Euler ) : boolean

Returns `true` if this Euler instance is equal with the given one.

**euler**

The Euler instance to test for equality.

**Returns:** Whether this Euler instance is equal with the given one.

### .fromArray( array : Array.<number, number, number, ?string> ) : Euler

Sets this Euler instance's components to values from the given array. The first three entries of the array are assign to the x,y and z components. An optional fourth entry defines the Euler order.

**array**

An array holding the Euler component values.

**Returns:** A reference to this Euler instance.

### .reorder( newOrder : string ) : Euler

Resets the euler angle with a new order by creating a quaternion from this euler angle and then setting this euler angle with the quaternion and the new order.

Warning: This discards revolution information.

**newOrder**

A string representing the new order that the rotations are applied.

**Returns:** A reference to this Euler instance.

### .set( x : number, y : number, z : number, order : string ) : Euler

Sets the Euler components.

**x**

The angle of the x axis in radians.

**y**

The angle of the y axis in radians.

**z**

The angle of the z axis in radians.

**order**

A string representing the order that the rotations are applied.

**Returns:** A reference to this Euler instance.

### .setFromQuaternion( q : Quaternion, order : string, update : boolean ) : Euler

Sets the angles of this Euler instance from a normalized quaternion.

**q**

A normalized Quaternion.

**order**

A string representing the order that the rotations are applied.

**update**

Whether the internal `onChange` callback should be executed or not.

Default is `true`.

**Returns:** A reference to this Euler instance.

### .setFromRotationMatrix( m : Matrix4, order : string, update : boolean ) : Euler

Sets the angles of this Euler instance from a pure rotation matrix.

**m**

A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).

**order**

A string representing the order that the rotations are applied.

**update**

Whether the internal `onChange` callback should be executed or not.

Default is `true`.

**Returns:** A reference to this Euler instance.

### .setFromVector3( v : Vector3, order : string ) : Euler

Sets the angles of this Euler instance from the given vector.

**v**

The vector.

**order**

A string representing the order that the rotations are applied.

**Returns:** A reference to this Euler instance.

### .toArray( array : Array.<number, number, number, string>, offset : number ) : Array.<number, number, number, string>

Writes the components of this Euler instance to the given array. If no array is provided, the method returns a new instance.

**array**

The target array holding the Euler components.

Default is `[]`.

**offset**

Index of the first element in the array.

Default is `0`.

**Returns:** The Euler components.

## Source

[src/math/Euler.js](https://github.com/mrdoob/three.js/blob/master/src/math/Euler.js)