*Inheritance: Curve →*

# DecoratedTorusKnot5c

A Decorated Torus Knot 5c.

## Import

DecoratedTorusKnot5c is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DecoratedTorusKnot5c } from 'three/addons/curves/CurveExtras.js';
```

## Constructor

### new DecoratedTorusKnot5c( scale : number )

Constructs a new Decorated Torus Knot 5c.

**scale**

The curve's scale.

Default is `1`.

## Properties

### .scale : number

The curve's scale.

Default is `40`.

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