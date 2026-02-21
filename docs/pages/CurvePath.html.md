*Inheritance: Curve →*

# CurvePath

A base class extending [Curve](Curve.html). `CurvePath` is simply an array of connected curves, but retains the API of a curve.

## Constructor

### new CurvePath()

Constructs a new curve path.

## Properties

### .autoClose : boolean

Whether the path should automatically be closed by a line curve.

Default is `false`.

### .curves : Array.<Curve>

An array of curves defining the path.

## Methods

### .add( curve : Curve )

Adds a curve to this curve path.

**curve**

The curve to add.

### .closePath() : CurvePath

Adds a line curve to close the path.

**Returns:** A reference to this curve path.

### .getCurveLengths() : Array.<number>

Returns list of cumulative curve lengths of the defined curves.

**Returns:** The curve lengths.

### .getPoint( t : number, optionalTarget : Vector2 | Vector3 ) : Vector2 | Vector3

This method returns a vector in 2D or 3D space (depending on the curve definitions) for the given interpolation factor.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getPoint](Curve.html#getPoint)

**Returns:** The position on the curve. It can be a 2D or 3D vector depending on the curve definition.

## Source

[src/extras/core/CurvePath.js](https://github.com/mrdoob/three.js/blob/master/src/extras/core/CurvePath.js)