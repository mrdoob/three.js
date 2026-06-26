*Inheritance: Curve →*

# KnotCurve

A knot curve.

## Import

KnotCurve is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { KnotCurve } from 'three/addons/curves/CurveExtras.js';
```

## Constructor

### new KnotCurve()

## Methods

### .getPoint( t : number, optionalTarget : Vector3 ) : Vector3

This method returns a vector in 3D space for the given interpolation factor.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getPoint](Curve.html#getPoint)

**Returns:** The position on the curve.

## Source

[examples/jsm/curves/CurveExtras.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/curves/CurveExtras.js)