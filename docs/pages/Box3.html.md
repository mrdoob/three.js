# Box3

Represents an axis-aligned bounding box (AABB) in 3D space.

## Constructor

### new Box3( min : Vector3, max : Vector3 )

Constructs a new bounding box.

**min**

A vector representing the lower boundary of the box.

Default is `(Infinity,Infinity,Infinity)`.

**max**

A vector representing the upper boundary of the box.

Default is `(-Infinity,-Infinity,-Infinity)`.

## Properties

### .isBox3 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .max : Vector3

The upper boundary of the box.

### .min : Vector3

The lower boundary of the box.

## Methods

### .applyMatrix4( matrix : Matrix4 ) : Box3

Transforms this bounding box by the given 4x4 transformation matrix.

**matrix**

The transformation matrix.

**Returns:** A reference to this bounding box.

### .clampPoint( point : Vector3, target : Vector3 ) : Vector3

Clamps the given point within the bounds of this box.

**point**

The point to clamp.

**target**

The target vector that is used to store the method's result.

**Returns:** The clamped point.

### .clone() : Box3

Returns a new box with copied values from this instance.

**Returns:** A clone of this instance.

### .containsBox( box : Box3 ) : boolean

Returns `true` if this bounding box includes the entirety of the given bounding box. If this box and the given one are identical, this function also returns `true`.

**box**

The bounding box to test.

**Returns:** Whether the bounding box contains the given bounding box or not.

### .containsPoint( point : Vector3 ) : boolean

Returns `true` if the given point lies within or on the boundaries of this box.

**point**

The point to test.

**Returns:** Whether the bounding box contains the given point or not.

### .copy( box : Box3 ) : Box3

Copies the values of the given box to this instance.

**box**

The box to copy.

**Returns:** A reference to this bounding box.

### .distanceToPoint( point : Vector3 ) : number

Returns the euclidean distance from any edge of this box to the specified point. If the given point lies inside of this box, the distance will be `0`.

**point**

The point to compute the distance to.

**Returns:** The euclidean distance.

### .equals( box : Box3 ) : boolean

Returns `true` if this bounding box is equal with the given one.

**box**

The box to test for equality.

**Returns:** Whether this bounding box is equal with the given one.

### .expandByObject( object : Object3D, precise : boolean ) : Box3

Expands the boundaries of this box to include the given 3D object and its children, accounting for the object's, and children's, world transforms. The function may result in a larger box than strictly necessary (unless the precise parameter is set to true).

**object**

The 3D object that should expand the bounding box.

**precise**

If set to `true`, the method expands the bounding box as little as necessary at the expense of more computation.

Default is `false`.

**Returns:** A reference to this bounding box.

### .expandByPoint( point : Vector3 ) : Box3

Expands the boundaries of this box to include the given point.

**point**

The point that should be included by the bounding box.

**Returns:** A reference to this bounding box.

### .expandByScalar( scalar : number ) : Box3

Expands each dimension of the box by the given scalar. If negative, the dimensions of the box will be contracted.

**scalar**

The scalar value that should expand the bounding box.

**Returns:** A reference to this bounding box.

### .expandByVector( vector : Vector3 ) : Box3

Expands this box equilaterally by the given vector. The width of this box will be expanded by the x component of the vector in both directions. The height of this box will be expanded by the y component of the vector in both directions. The depth of this box will be expanded by the z component of the vector in both directions.

**vector**

The vector that should expand the bounding box.

**Returns:** A reference to this bounding box.

### .fromJSON( json : Object ) : Box3

Returns a serialized structure of the bounding box.

**json**

The serialized json to set the box from.

**Returns:** A reference to this bounding box.

### .getBoundingSphere( target : Sphere ) : Sphere

Returns a bounding sphere that encloses this bounding box.

**target**

The target sphere that is used to store the method's result.

**Returns:** The bounding sphere that encloses this bounding box.

### .getCenter( target : Vector3 ) : Vector3

Returns the center point of this box.

**target**

The target vector that is used to store the method's result.

**Returns:** The center point.

### .getParameter( point : Vector3, target : Vector3 ) : Vector3

Returns a point as a proportion of this box's width, height and depth.

**point**

A point in 3D space.

**target**

The target vector that is used to store the method's result.

**Returns:** A point as a proportion of this box's width, height and depth.

### .getSize( target : Vector3 ) : Vector3

Returns the dimensions of this box.

**target**

The target vector that is used to store the method's result.

**Returns:** The size.

### .intersect( box : Box3 ) : Box3

Computes the intersection of this bounding box and the given one, setting the upper bound of this box to the lesser of the two boxes' upper bounds and the lower bound of this box to the greater of the two boxes' lower bounds. If there's no overlap, makes this box empty.

**box**

The bounding box to intersect with.

**Returns:** A reference to this bounding box.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if the given bounding box intersects with this bounding box.

**box**

The bounding box to test.

**Returns:** Whether the given bounding box intersects with this bounding box.

### .intersectsPlane( plane : Plane ) : boolean

Returns `true` if the given plane intersects with this bounding box.

**plane**

The plane to test.

**Returns:** Whether the given plane intersects with this bounding box.

### .intersectsSphere( sphere : Sphere ) : boolean

Returns `true` if the given bounding sphere intersects with this bounding box.

**sphere**

The bounding sphere to test.

**Returns:** Whether the given bounding sphere intersects with this bounding box.

### .intersectsTriangle( triangle : Triangle ) : boolean

Returns `true` if the given triangle intersects with this bounding box.

**triangle**

The triangle to test.

**Returns:** Whether the given triangle intersects with this bounding box.

### .isEmpty() : boolean

Returns true if this box includes zero points within its bounds. Note that a box with equal lower and upper bounds still includes one point, the one both bounds share.

**Returns:** Whether this box is empty or not.

### .makeEmpty() : Box3

Makes this box empty which means in encloses a zero space in 3D.

**Returns:** A reference to this bounding box.

### .set( min : Vector3, max : Vector3 ) : Box3

Sets the lower and upper boundaries of this box. Please note that this method only copies the values from the given objects.

**min**

The lower boundary of the box.

**max**

The upper boundary of the box.

**Returns:** A reference to this bounding box.

### .setFromArray( array : Array.<number> ) : Box3

Sets the upper and lower bounds of this box so it encloses the position data in the given array.

**array**

An array holding 3D position data.

**Returns:** A reference to this bounding box.

### .setFromBufferAttribute( attribute : BufferAttribute ) : Box3

Sets the upper and lower bounds of this box so it encloses the position data in the given buffer attribute.

**attribute**

A buffer attribute holding 3D position data.

**Returns:** A reference to this bounding box.

### .setFromCenterAndSize( center : Vector3, size : Vector3 ) : Box3

Centers this box on the given center vector and sets this box's width, height and depth to the given size values.

**center**

The center of the box.

**size**

The x, y and z dimensions of the box.

**Returns:** A reference to this bounding box.

### .setFromObject( object : Object3D, precise : boolean ) : Box3

Computes the world-axis-aligned bounding box for the given 3D object (including its children), accounting for the object's, and children's, world transforms. The function may result in a larger box than strictly necessary.

**object**

The 3D object to compute the bounding box for.

**precise**

If set to `true`, the method computes the smallest world-axis-aligned bounding box at the expense of more computation.

Default is `false`.

**Returns:** A reference to this bounding box.

### .setFromPoints( points : Array.<Vector3> ) : Box3

Sets the upper and lower bounds of this box so it encloses the position data in the given array.

**points**

An array holding 3D position data as instances of [Vector3](Vector3.html).

**Returns:** A reference to this bounding box.

### .toJSON() : Object

Returns a serialized structure of the bounding box.

**Returns:** Serialized structure with fields representing the object state.

### .translate( offset : Vector3 ) : Box3

Adds the given offset to both the upper and lower bounds of this bounding box, effectively moving it in 3D space.

**offset**

The offset that should be used to translate the bounding box.

**Returns:** A reference to this bounding box.

### .union( box : Box3 ) : Box3

Computes the union of this box and another and the given one, setting the upper bound of this box to the greater of the two boxes' upper bounds and the lower bound of this box to the lesser of the two boxes' lower bounds.

**box**

The bounding box that will be unioned with this instance.

**Returns:** A reference to this bounding box.

## Source

[src/math/Box3.js](https://github.com/mrdoob/three.js/blob/master/src/math/Box3.js)