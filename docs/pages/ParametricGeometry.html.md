*Inheritance: EventDispatcher → BufferGeometry →*

# ParametricGeometry

This class can be used to generate a geometry based on a parametric surface.

Reference: [Mesh Generation with Python](https://prideout.net/blog/old/blog/index.html@p=44.html)

## Code Example

```js
const geometry = new THREE.ParametricGeometry( klein, 25, 25 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const klein = new THREE.Mesh( geometry, material );
scene.add( klein );
```

## Import

ParametricGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
```

## Constructor

### new ParametricGeometry( func : ParametricGeometry~Func, slices : number, stacks : number )

Constructs a new parametric geometry.

**func**

The parametric function. Default is a function that generates a curved plane surface.

**slices**

The number of slices to use for the parametric function.

Default is `8`.

**stacks**

The stacks of slices to use for the parametric function.

Default is `8`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Type Definitions

### .Func( u : number, v : number, target : Vector3 )

Parametric function definition of `ParametricGeometry`.

**u**

The `u` coordinate on the surface in the range `[0,1]`.

**v**

The `v` coordinate on the surface in the range `[0,1]`.

**target**

The target vector that is used to store the method's result.

## Source

[examples/jsm/geometries/ParametricGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/ParametricGeometry.js)