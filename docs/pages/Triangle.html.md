# Triangle

A geometric triangle as defined by three vectors representing its three corners.

## Constructor

### new Triangle( a : Vector3, b : Vector3, c : Vector3 )

Constructs a new triangle.

**a**

The first corner of the triangle.

Default is `(0,0,0)`.

**b**

The second corner of the triangle.

Default is `(0,0,0)`.

**c**

The third corner of the triangle.

Default is `(0,0,0)`.

## Properties

### .a : Vector3

The first corner of the triangle.

### .b : Vector3

The second corner of the triangle.

### .c : Vector3

The third corner of the triangle.

## Methods

### .clone() : Triangle

Returns a new triangle with copied values from this instance.

**Returns:** A clone of this instance.

### .closestPointToPoint( p : Vector3, target : Vector3 ) : Vector3

Returns the closest point on the triangle to the given point.

**p**

The point to compute the closest point for.

**target**

The target vector that is used to store the method's result.

**Returns:** The closest point on the triangle.

### .containsPoint( point : Vector3 ) : boolean

Returns `true` if the given point, when projected onto the plane of the triangle, lies within the triangle.

**point**

The point in 3D space to test.

**Returns:** Whether the given point, when projected onto the plane of the triangle, lies within the triangle or not.

### .copy( triangle : Triangle ) : Triangle

Copies the values of the given triangle to this instance.

**triangle**

The triangle to copy.

**Returns:** A reference to this triangle.

### .equals( triangle : Triangle ) : boolean

Returns `true` if this triangle is equal with the given one.

**triangle**

The triangle to test for equality.

**Returns:** Whether this triangle is equal with the given one.

### .getArea() : number

Computes the area of the triangle.

**Returns:** The triangle's area.

### .getBarycoord( point : Vector3, target : Vector3 ) : Vector3

Computes a barycentric coordinates from the given vector. Returns `null` if the triangle is degenerate.

**point**

A point in 3D space.

**target**

The target vector that is used to store the method's result.

**Returns:** The barycentric coordinates for the given point

### .getInterpolation( point : Vector3, v1 : Vector3, v2 : Vector3, v3 : Vector3, target : Vector3 ) : Vector3

Computes the value barycentrically interpolated for the given point on the triangle. Returns `null` if the triangle is degenerate.

**point**

Position of interpolated point.

**v1**

Value to interpolate of first vertex.

**v2**

Value to interpolate of second vertex.

**v3**

Value to interpolate of third vertex.

**target**

The target vector that is used to store the method's result.

**Returns:** The interpolated value.

### .getMidpoint( target : Vector3 ) : Vector3

Computes the midpoint of the triangle.

**target**

The target vector that is used to store the method's result.

**Returns:** The triangle's midpoint.

### .getNormal( target : Vector3 ) : Vector3

Computes the normal of the triangle.

**target**

The target vector that is used to store the method's result.

**Returns:** The triangle's normal.

### .getPlane( target : Plane ) : Plane

Computes a plane the triangle lies within.

**target**

The target vector that is used to store the method's result.

**Returns:** The plane the triangle lies within.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if this triangle intersects with the given box.

**box**

The box to intersect.

**Returns:** Whether this triangle intersects with the given box or not.

### .isFrontFacing( direction : Vector3 ) : boolean

Returns `true` if the triangle is oriented towards the given direction.

**direction**

The (normalized) direction vector.

**Returns:** Whether the triangle is oriented towards the given direction or not.

### .set( a : Vector3, b : Vector3, c : Vector3 ) : Triangle

Sets the triangle's vertices by copying the given values.

**a**

The first corner of the triangle.

**b**

The second corner of the triangle.

**c**

The third corner of the triangle.

**Returns:** A reference to this triangle.

### .setFromAttributeAndIndices( attribute : BufferAttribute, i0 : number, i1 : number, i2 : number ) : Triangle

Sets the triangle's vertices by copying the given attribute values.

**attribute**

A buffer attribute with 3D points data.

**i0**

The attribute index representing the first corner of the triangle.

**i1**

The attribute index representing the second corner of the triangle.

**i2**

The attribute index representing the third corner of the triangle.

**Returns:** A reference to this triangle.

### .setFromPointsAndIndices( points : Array.<Vector3>, i0 : number, i1 : number, i2 : number ) : Triangle

Sets the triangle's vertices by copying the given array values.

**points**

An array with 3D points.

**i0**

The array index representing the first corner of the triangle.

**i1**

The array index representing the second corner of the triangle.

**i2**

The array index representing the third corner of the triangle.

**Returns:** A reference to this triangle.

## Static Methods

### .containsPoint( point : Vector3, a : Vector3, b : Vector3, c : Vector3 ) : boolean

Returns `true` if the given point, when projected onto the plane of the triangle, lies within the triangle.

**point**

The point in 3D space to test.

**a**

The first corner of the triangle.

**b**

The second corner of the triangle.

**c**

The third corner of the triangle.

**Returns:** Whether the given point, when projected onto the plane of the triangle, lies within the triangle or not.

### .getBarycoord( point : Vector3, a : Vector3, b : Vector3, c : Vector3, target : Vector3 ) : Vector3

Computes a barycentric coordinates from the given vector. Returns `null` if the triangle is degenerate.

**point**

A point in 3D space.

**a**

The first corner of the triangle.

**b**

The second corner of the triangle.

**c**

The third corner of the triangle.

**target**

The target vector that is used to store the method's result.

**Returns:** The barycentric coordinates for the given point

### .getInterpolatedAttribute( attr : BufferAttribute, i1 : number, i2 : number, i3 : number, barycoord : Vector3, target : Vector3 ) : Vector3

Computes the value barycentrically interpolated for the given attribute and indices.

**attr**

The attribute to interpolate.

**i1**

Index of first vertex.

**i2**

Index of second vertex.

**i3**

Index of third vertex.

**barycoord**

The barycoordinate value to use to interpolate.

**target**

The target vector that is used to store the method's result.

**Returns:** The interpolated attribute value.

### .getInterpolation( point : Vector3, p1 : Vector3, p2 : Vector3, p3 : Vector3, v1 : Vector3, v2 : Vector3, v3 : Vector3, target : Vector3 ) : Vector3

Computes the value barycentrically interpolated for the given point on the triangle. Returns `null` if the triangle is degenerate.

**point**

Position of interpolated point.

**p1**

The first corner of the triangle.

**p2**

The second corner of the triangle.

**p3**

The third corner of the triangle.

**v1**

Value to interpolate of first vertex.

**v2**

Value to interpolate of second vertex.

**v3**

Value to interpolate of third vertex.

**target**

The target vector that is used to store the method's result.

**Returns:** The interpolated value.

### .getNormal( a : Vector3, b : Vector3, c : Vector3, target : Vector3 ) : Vector3

Computes the normal vector of a triangle.

**a**

The first corner of the triangle.

**b**

The second corner of the triangle.

**c**

The third corner of the triangle.

**target**

The target vector that is used to store the method's result.

**Returns:** The triangle's normal.

### .isFrontFacing( a : Vector3, b : Vector3, c : Vector3, direction : Vector3 ) : boolean

Returns `true` if the triangle is oriented towards the given direction.

**a**

The first corner of the triangle.

**b**

The second corner of the triangle.

**c**

The third corner of the triangle.

**direction**

The (normalized) direction vector.

**Returns:** Whether the triangle is oriented towards the given direction or not.

## Source

[src/math/Triangle.js](https://github.com/mrdoob/three.js/blob/master/src/math/Triangle.js)