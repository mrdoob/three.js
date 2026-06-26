# ShapeUtils

A class containing utility functions for shapes.

## Static Methods

### .area( contour : Array.<Vector2> ) : number

Calculate area of a ( 2D ) contour polygon.

**contour**

An array of 2D points.

**Returns:** The area.

### .isClockWise( pts : Array.<Vector2> ) : boolean

Returns `true` if the given contour uses a clockwise winding order.

**pts**

An array of 2D points defining a polygon.

**Returns:** Whether the given contour uses a clockwise winding order or not.

### .triangulateShape( contour : Array.<Vector2>, holes : Array.<Array.<Vector2>> ) : Array.<Array.<number>>

Triangulates the given shape definition.

**contour**

An array of 2D points defining the contour.

**holes**

An array that holds arrays of 2D points defining the holes.

**Returns:** An array that holds for each face definition an array with three indices.

## Source

[src/extras/ShapeUtils.js](https://github.com/mrdoob/three.js/blob/master/src/extras/ShapeUtils.js)