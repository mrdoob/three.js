*Inheritance: Curve →*

# NURBSCurve

This class represents a NURBS curve.

Implementation is based on `(x, y [, z=0 [, w=1]])` control points with `w=weight`.

## Import

NURBSCurve is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';
```

## Constructor

### new NURBSCurve( degree : number, knots : Array.<number>, controlPoints : Array.<(Vector2|Vector3|Vector4)>, startKnot : number, endKnot : number )

Constructs a new NURBS curve.

**degree**

The NURBS degree.

**knots**

The knots as a flat array of numbers.

**controlPoints**

An array holding control points.

**startKnot**

Index of the start knot into the `knots` array.

**endKnot**

Index of the end knot into the `knots` array.

## Properties

### .controlPoints : Array.<Vector4>

An array of control points.

### .degree : number

The NURBS degree.

### .endKnot : number

Index of the end knot into the `knots` array.

### .knots : Array.<number>

The knots as a flat array of numbers.

### .startKnot : number

Index of the start knot into the `knots` array.

## Methods

### .getPoint( t : number, optionalTarget : Vector3 ) : Vector3

This method returns a vector in 3D space for the given interpolation factor.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getPoint](Curve.html#getPoint)

**Returns:** The position on the curve.

### .getTangent( t : number, optionalTarget : Vector3 ) : Vector3

Returns a unit vector tangent for the given interpolation factor.

**t**

The interpolation factor.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getTangent](Curve.html#getTangent)

**Returns:** The tangent vector.

## Source

[examples/jsm/curves/NURBSCurve.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/curves/NURBSCurve.js)