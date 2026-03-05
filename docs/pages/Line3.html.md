# Line3

An analytical line segment in 3D space represented by a start and end point.

## Constructor

### new Line3( start : Vector3, end : Vector3 )

Constructs a new line segment.

**start**

Start of the line segment.

Default is `(0,0,0)`.

**end**

End of the line segment.

Default is `(0,0,0)`.

## Properties

### .end : Vector3

End of the line segment.

### .start : Vector3

Start of the line segment.

## Methods

### .applyMatrix4( matrix : Matrix4 ) : Line3

Applies a 4x4 transformation matrix to this line segment.

**matrix**

The transformation matrix.

**Returns:** A reference to this line segment.

### .at( t : number, target : Vector3 ) : Vector3

Returns a vector at a certain position along the line segment.

**t**

A value between `[0,1]` to represent a position along the line segment.

**target**

The target vector that is used to store the method's result.

**Returns:** The delta vector.

### .clone() : Line3

Returns a new line segment with copied values from this instance.

**Returns:** A clone of this instance.

### .closestPointToPoint( point : Vector3, clampToLine : boolean, target : Vector3 ) : Vector3

Returns the closest point on the line for a given point.

**point**

The point to compute the closest point on the line for.

**clampToLine**

Whether to clamp the result to the range `[0,1]` or not.

**target**

The target vector that is used to store the method's result.

**Returns:** The closest point on the line.

### .closestPointToPointParameter( point : Vector3, clampToLine : boolean ) : number

Returns a point parameter based on the closest point as projected on the line segment.

**point**

The point for which to return a point parameter.

**clampToLine**

Whether to clamp the result to the range `[0,1]` or not.

**Returns:** The point parameter.

### .copy( line : Line3 ) : Line3

Copies the values of the given line segment to this instance.

**line**

The line segment to copy.

**Returns:** A reference to this line segment.

### .delta( target : Vector3 ) : Vector3

Returns the delta vector of the line segment's start and end point.

**target**

The target vector that is used to store the method's result.

**Returns:** The delta vector.

### .distance() : number

Returns the Euclidean distance between the line' start and end point.

**Returns:** The Euclidean distance.

### .distanceSq() : number

Returns the squared Euclidean distance between the line' start and end point.

**Returns:** The squared Euclidean distance.

### .distanceSqToLine3( line : Line3, c1 : Vector3, c2 : Vector3 ) : number

Returns the closest squared distance between this line segment and the given one.

**line**

The line segment to compute the closest squared distance to.

**c1**

The closest point on this line segment.

**c2**

The closest point on the given line segment.

**Returns:** The squared distance between this line segment and the given one.

### .equals( line : Line3 ) : boolean

Returns `true` if this line segment is equal with the given one.

**line**

The line segment to test for equality.

**Returns:** Whether this line segment is equal with the given one.

### .getCenter( target : Vector3 ) : Vector3

Returns the center of the line segment.

**target**

The target vector that is used to store the method's result.

**Returns:** The center point.

### .set( start : Vector3, end : Vector3 ) : Line3

Sets the start and end values by copying the given vectors.

**start**

The start point.

**end**

The end point.

**Returns:** A reference to this line segment.

## Source

[src/math/Line3.js](https://github.com/mrdoob/three.js/blob/master/src/math/Line3.js)