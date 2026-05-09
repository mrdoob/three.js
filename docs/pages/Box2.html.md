# Box2

Represents an axis-aligned bounding box (AABB) in 2D space.

## Constructor

### new Box2( min : Vector2, max : Vector2 )

Constructs a new bounding box.

**min**

A vector representing the lower boundary of the box.

Default is `(Infinity,Infinity)`.

**max**

A vector representing the upper boundary of the box.

Default is `(-Infinity,-Infinity)`.

## Properties

### .isBox2 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .max : Vector2

The upper boundary of the box.

### .min : Vector2

The lower boundary of the box.

## Methods

### .clampPoint( point : Vector2, target : Vector2 ) : Vector2

Clamps the given point within the bounds of this box.

**point**

The point to clamp.

**target**

The target vector that is used to store the method's result.

**Returns:** The clamped point.

### .clone() : Box2

Returns a new box with copied values from this instance.

**Returns:** A clone of this instance.

### .containsBox( box : Box2 ) : boolean

Returns `true` if this bounding box includes the entirety of the given bounding box. If this box and the given one are identical, this function also returns `true`.

**box**

The bounding box to test.

**Returns:** Whether the bounding box contains the given bounding box or not.

### .containsPoint( point : Vector2 ) : boolean

Returns `true` if the given point lies within or on the boundaries of this box.

**point**

The point to test.

**Returns:** Whether the bounding box contains the given point or not.

### .copy( box : Box2 ) : Box2

Copies the values of the given box to this instance.

**box**

The box to copy.

**Returns:** A reference to this bounding box.

### .distanceToPoint( point : Vector2 ) : number

Returns the euclidean distance from any edge of this box to the specified point. If the given point lies inside of this box, the distance will be `0`.

**point**

The point to compute the distance to.

**Returns:** The euclidean distance.

### .equals( box : Box2 ) : boolean

Returns `true` if this bounding box is equal with the given one.

**box**

The box to test for equality.

**Returns:** Whether this bounding box is equal with the given one.

### .expandByPoint( point : Vector2 ) : Box2

Expands the boundaries of this box to include the given point.

**point**

The point that should be included by the bounding box.

**Returns:** A reference to this bounding box.

### .expandByScalar( scalar : number ) : Box2

Expands each dimension of the box by the given scalar. If negative, the dimensions of the box will be contracted.

**scalar**

The scalar value that should expand the bounding box.

**Returns:** A reference to this bounding box.

### .expandByVector( vector : Vector2 ) : Box2

Expands this box equilaterally by the given vector. The width of this box will be expanded by the x component of the vector in both directions. The height of this box will be expanded by the y component of the vector in both directions.

**vector**

The vector that should expand the bounding box.

**Returns:** A reference to this bounding box.

### .getCenter( target : Vector2 ) : Vector2

Returns the center point of this box.

**target**

The target vector that is used to store the method's result.

**Returns:** The center point.

### .getParameter( point : Vector2, target : Vector2 ) : Vector2

Returns a point as a proportion of this box's width and height.

**point**

A point in 2D space.

**target**

The target vector that is used to store the method's result.

**Returns:** A point as a proportion of this box's width and height.

### .getSize( target : Vector2 ) : Vector2

Returns the dimensions of this box.

**target**

The target vector that is used to store the method's result.

**Returns:** The size.

### .intersect( box : Box2 ) : Box2

Computes the intersection of this bounding box and the given one, setting the upper bound of this box to the lesser of the two boxes' upper bounds and the lower bound of this box to the greater of the two boxes' lower bounds. If there's no overlap, makes this box empty.

**box**

The bounding box to intersect with.

**Returns:** A reference to this bounding box.

### .intersectsBox( box : Box2 ) : boolean

Returns `true` if the given bounding box intersects with this bounding box.

**box**

The bounding box to test.

**Returns:** Whether the given bounding box intersects with this bounding box.

### .isEmpty() : boolean

Returns true if this box includes zero points within its bounds. Note that a box with equal lower and upper bounds still includes one point, the one both bounds share.

**Returns:** Whether this box is empty or not.

### .makeEmpty() : Box2

Makes this box empty which means in encloses a zero space in 2D.

**Returns:** A reference to this bounding box.

### .set( min : Vector2, max : Vector2 ) : Box2

Sets the lower and upper boundaries of this box. Please note that this method only copies the values from the given objects.

**min**

The lower boundary of the box.

**max**

The upper boundary of the box.

**Returns:** A reference to this bounding box.

### .setFromCenterAndSize( center : Vector2, size : Vector2 ) : Box2

Centers this box on the given center vector and sets this box's width, height and depth to the given size values.

**center**

The center of the box.

**size**

The x and y dimensions of the box.

**Returns:** A reference to this bounding box.

### .setFromPoints( points : Array.<Vector2> ) : Box2

Sets the upper and lower bounds of this box so it encloses the position data in the given array.

**points**

An array holding 2D position data as instances of [Vector2](Vector2.html).

**Returns:** A reference to this bounding box.

### .translate( offset : Vector2 ) : Box2

Adds the given offset to both the upper and lower bounds of this bounding box, effectively moving it in 2D space.

**offset**

The offset that should be used to translate the bounding box.

**Returns:** A reference to this bounding box.

### .union( box : Box2 ) : Box2

Computes the union of this box and another and the given one, setting the upper bound of this box to the greater of the two boxes' upper bounds and the lower bound of this box to the lesser of the two boxes' lower bounds.

**box**

The bounding box that will be unioned with this instance.

**Returns:** A reference to this bounding box.

## Source

[src/math/Box2.js](https://github.com/mrdoob/three.js/blob/master/src/math/Box2.js)