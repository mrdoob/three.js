# ParametricFunctions

## Import

ParametricFunctions is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as ParametricFunctions from 'three/addons/geometries/ParametricFunctions.js';
```

## Methods

### .klein( v : number, u : number, target : Vector3 ) (inner)

A parametric function representing the Klein bottle.

**v**

The `v` coordinate on the surface in the range `[0,1]`.

**u**

The `u` coordinate on the surface in the range `[0,1]`.

**target**

The target vector that is used to store the method's result.

### .mobius( u : number, t : number, target : Vector3 ) (inner)

A parametric function representing a flat mobius strip.

**u**

The `u` coordinate on the surface in the range `[0,1]`.

**t**

The `v` coordinate on the surface in the range `[0,1]`.

**target**

The target vector that is used to store the method's result.

### .mobius3d( u : number, t : number, target : Vector3 ) (inner)

A parametric function representing a volumetric mobius strip.

**u**

The `u` coordinate on the surface in the range `[0,1]`.

**t**

The `v` coordinate on the surface in the range `[0,1]`.

**target**

The target vector that is used to store the method's result.

### .plane( u : number, v : number, target : Vector3 ) (inner)

A parametric function representing a flat plane.

**u**

The `u` coordinate on the surface in the range `[0,1]`.

**v**

The `v` coordinate on the surface in the range `[0,1]`.

**target**

The target vector that is used to store the method's result.

## Source

[examples/jsm/geometries/ParametricFunctions.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/ParametricFunctions.js)