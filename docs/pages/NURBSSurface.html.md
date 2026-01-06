# NURBSSurface

This class represents a NURBS surface.

Implementation is based on `(x, y [, z=0 [, w=1]])` control points with `w=weight`.

## Import

NURBSSurface is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
```

## Constructor

### new NURBSSurface( degree1 : number, degree2 : number, knots1 : Array.<number>, knots2 : Array.<number>, controlPoints : Array.<Array.<(Vector2|Vector3|Vector4)>> )

Constructs a new NURBS surface.

**degree1**

The first NURBS degree.

**degree2**

The second NURBS degree.

**knots1**

The first knots as a flat array of numbers.

**knots2**

The second knots as a flat array of numbers.

**controlPoints**

An array^2 holding control points.

## Properties

### .controlPoints : Array.<Array.<(Vector2|Vector3|Vector4)>>

An array holding arrays of control points.

### .degree1 : number

The first NURBS degree.

### .degree2 : number

The second NURBS degree.

### .knots1 : Array.<number>

The first knots as a flat array of numbers.

### .knots2 : Array.<number>

The second knots as a flat array of numbers.

## Methods

### .getPoint( t1 : number, t2 : number, target : Vector3 )

This method returns a vector in 3D space for the given interpolation factor. This vector lies on the NURBS surface.

**t1**

The first interpolation factor representing the `u` position on the surface. Must be in the range `[0,1]`.

**t2**

The second interpolation factor representing the `v` position on the surface. Must be in the range `[0,1]`.

**target**

The target vector the result is written to.

## Source

[examples/jsm/curves/NURBSSurface.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/curves/NURBSSurface.js)