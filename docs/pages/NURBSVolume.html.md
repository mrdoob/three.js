# NURBSVolume

This class represents a NURBS volume.

Implementation is based on `(x, y [, z=0 [, w=1]])` control points with `w=weight`.

## Import

NURBSVolume is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { NURBSVolume } from 'three/addons/curves/NURBSVolume.js';
```

## Constructor

### new NURBSVolume( degree1 : number, degree2 : number, degree3 : number, knots1 : Array.<number>, knots2 : Array.<number>, knots3 : Array.<number>, controlPoints : Array.<Array.<Array.<(Vector2|Vector3|Vector4)>>> )

Constructs a new NURBS surface.

**degree1**

The first NURBS degree.

**degree2**

The second NURBS degree.

**degree3**

The third NURBS degree.

**knots1**

The first knots as a flat array of numbers.

**knots2**

The second knots as a flat array of numbers.

**knots3**

The third knots as a flat array of numbers.

**controlPoints**

An array^3 holding control points.

## Methods

### .getPoint( t1 : number, t2 : number, t3 : number, target : Vector3 )

This method returns a vector in 3D space for the given interpolation factor. This vector lies within the NURBS volume.

**t1**

The first interpolation factor representing the `u` position within the volume. Must be in the range `[0,1]`.

**t2**

The second interpolation factor representing the `v` position within the volume. Must be in the range `[0,1]`.

**t3**

The third interpolation factor representing the `w` position within the volume. Must be in the range `[0,1]`.

**target**

The target vector the result is written to.

## Source

[examples/jsm/curves/NURBSVolume.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/curves/NURBSVolume.js)