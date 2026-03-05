# Plane

A two dimensional surface that extends infinitely in 3D space, represented in [Hessian normal form](http://mathworld.wolfram.com/HessianNormalForm.html) by a unit length normal vector and a constant.

## Constructor

### new Plane( normal : Vector3, constant : number )

Constructs a new plane.

**normal**

A unit length vector defining the normal of the plane.

Default is `(1,0,0)`.

**constant**

The signed distance from the origin to the plane.

Default is `0`.

## Properties

### .constant : number

The signed distance from the origin to the plane.

Default is `0`.

### .isPlane : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .normal : Vector3

A unit length vector defining the normal of the plane.

## Methods

### .applyMatrix4( matrix : Matrix4, optionalNormalMatrix : Matrix4 ) : Plane

Apply a 4x4 matrix to the plane. The matrix must be an affine, homogeneous transform.

The optional normal matrix can be pre-computed like so:

```js
const optionalNormalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );
```

**matrix**

The transformation matrix.

**optionalNormalMatrix**

A pre-computed normal matrix.

**Returns:** A reference to this plane.

### .clone() : Plane

Returns a new plane with copied values from this instance.

**Returns:** A clone of this instance.

### .coplanarPoint( target : Vector3 ) : Vector3

Returns a coplanar vector to the plane, by calculating the projection of the normal at the origin onto the plane.

**target**

The target vector that is used to store the method's result.

**Returns:** The coplanar point.

### .copy( plane : Plane ) : Plane

Copies the values of the given plane to this instance.

**plane**

The plane to copy.

**Returns:** A reference to this plane.

### .distanceToPoint( point : Vector3 ) : number

Returns the signed distance from the given point to this plane.

**point**

The point to compute the distance for.

**Returns:** The signed distance.

### .distanceToSphere( sphere : Sphere ) : number

Returns the signed distance from the given sphere to this plane.

**sphere**

The sphere to compute the distance for.

**Returns:** The signed distance.

### .equals( plane : Plane ) : boolean

Returns `true` if this plane is equal with the given one.

**plane**

The plane to test for equality.

**Returns:** Whether this plane is equal with the given one.

### .intersectLine( line : Line3, target : Vector3 ) : Vector3

Returns the intersection point of the passed line and the plane. Returns `null` if the line does not intersect. Returns the line's starting point if the line is coplanar with the plane.

**line**

The line to compute the intersection for.

**target**

The target vector that is used to store the method's result.

**Returns:** The intersection point.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if the given bounding box intersects with the plane.

**box**

The bounding box to test.

**Returns:** Whether the given bounding box intersects with the plane or not.

### .intersectsLine( line : Line3 ) : boolean

Returns `true` if the given line segment intersects with (passes through) the plane.

**line**

The line to test.

**Returns:** Whether the given line segment intersects with the plane or not.

### .intersectsSphere( sphere : Sphere ) : boolean

Returns `true` if the given bounding sphere intersects with the plane.

**sphere**

The bounding sphere to test.

**Returns:** Whether the given bounding sphere intersects with the plane or not.

### .negate() : Plane

Negates both the plane normal and the constant.

**Returns:** A reference to this plane.

### .normalize() : Plane

Normalizes the plane normal and adjusts the constant accordingly.

**Returns:** A reference to this plane.

### .projectPoint( point : Vector3, target : Vector3 ) : Vector3

Projects a the given point onto the plane.

**point**

The point to project.

**target**

The target vector that is used to store the method's result.

**Returns:** The projected point on the plane.

### .set( normal : Vector3, constant : number ) : Plane

Sets the plane components by copying the given values.

**normal**

The normal.

**constant**

The constant.

**Returns:** A reference to this plane.

### .setComponents( x : number, y : number, z : number, w : number ) : Plane

Sets the plane components by defining `x`, `y`, `z` as the plane normal and `w` as the constant.

**x**

The value for the normal's x component.

**y**

The value for the normal's y component.

**z**

The value for the normal's z component.

**w**

The constant value.

**Returns:** A reference to this plane.

### .setFromCoplanarPoints( a : Vector3, b : Vector3, c : Vector3 ) : Plane

Sets the plane from three coplanar points. The winding order is assumed to be counter-clockwise, and determines the direction of the plane normal.

**a**

The first coplanar point.

**b**

The second coplanar point.

**c**

The third coplanar point.

**Returns:** A reference to this plane.

### .setFromNormalAndCoplanarPoint( normal : Vector3, point : Vector3 ) : Plane

Sets the plane from the given normal and coplanar point (that is a point that lies onto the plane).

**normal**

The normal.

**point**

A coplanar point.

**Returns:** A reference to this plane.

### .translate( offset : Vector3 ) : Plane

Translates the plane by the distance defined by the given offset vector. Note that this only affects the plane constant and will not affect the normal vector.

**offset**

The offset vector.

**Returns:** A reference to this plane.

## Source

[src/math/Plane.js](https://github.com/mrdoob/three.js/blob/master/src/math/Plane.js)