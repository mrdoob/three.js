# Spherical

This class can be used to represent points in 3D space as [Spherical coordinates](https://en.wikipedia.org/wiki/Spherical_coordinate_system).

## Constructor

### new Spherical( radius : number, phi : number, theta : number )

Constructs a new spherical.

**radius**

The radius, or the Euclidean distance (straight-line distance) from the point to the origin.

Default is `1`.

**phi**

The polar angle in radians from the y (up) axis.

Default is `0`.

**theta**

The equator/azimuthal angle in radians around the y (up) axis.

Default is `0`.

## Properties

### .phi : number

The polar angle in radians from the y (up) axis.

Default is `0`.

### .radius : number

The radius, or the Euclidean distance (straight-line distance) from the point to the origin.

Default is `1`.

### .theta : number

The equator/azimuthal angle in radians around the y (up) axis.

Default is `0`.

## Methods

### .clone() : Spherical

Returns a new spherical with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( other : Spherical ) : Spherical

Copies the values of the given spherical to this instance.

**other**

The spherical to copy.

**Returns:** A reference to this spherical.

### .makeSafe() : Spherical

Restricts the polar angle \[page:.phi phi\] to be between `0.000001` and pi - `0.000001`.

**Returns:** A reference to this spherical.

### .set( radius : number, phi : number, theta : number ) : Spherical

Sets the spherical components by copying the given values.

**radius**

The radius.

**phi**

The polar angle.

**theta**

The azimuthal angle.

**Returns:** A reference to this spherical.

### .setFromCartesianCoords( x : number, y : number, z : number ) : Spherical

Sets the spherical components from the given Cartesian coordinates.

**x**

The x value.

**y**

The y value.

**z**

The z value.

**Returns:** A reference to this spherical.

### .setFromVector3( v : Vector3 ) : Spherical

Sets the spherical components from the given vector which is assumed to hold Cartesian coordinates.

**v**

The vector to set.

**Returns:** A reference to this spherical.

## Source

[src/math/Spherical.js](https://github.com/mrdoob/three.js/blob/master/src/math/Spherical.js)