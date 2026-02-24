*Inheritance: Curve →*

# QuadraticBezierCurve3

A curve representing a 3D Quadratic Bezier curve.

## Constructor

### new QuadraticBezierCurve3( v0 : Vector3, v1 : Vector3, v2 : Vector3 )

Constructs a new Quadratic Bezier curve.

**v0**

The start point.

**v1**

The control point.

**v2**

The end point.

## Properties

### .isQuadraticBezierCurve3 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .v0 : Vector3

The start point.

### .v1 : Vector3

The control point.

### .v2 : Vector3

The end point.

## Methods

### .getPoint( t : number, optionalTarget : Vector3 ) : Vector3

Returns a point on the curve.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getPoint](Curve.html#getPoint)

**Returns:** The position on the curve.

## Source

[src/extras/curves/QuadraticBezierCurve3.js](https://github.com/mrdoob/three.js/blob/master/src/extras/curves/QuadraticBezierCurve3.js)