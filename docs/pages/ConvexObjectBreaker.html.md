# ConvexObjectBreaker

This class can be used to subdivide a convex Geometry object into pieces.

Use the function prepareBreakableObject to prepare a Mesh object to be broken. Then, call the various functions to subdivide the object (subdivideByImpact, cutByPlane). Sub-objects that are product of subdivision don't need prepareBreakableObject to be called on them.

Requisites for the object:

*   Mesh object must have a buffer geometry and a material.
*   Vertex normals must be planar (not smoothed).
*   The geometry must be convex (this is not checked in the library). You can create convex geometries with [ConvexGeometry](ConvexGeometry.html). The [BoxGeometry](BoxGeometry.html), [SphereGeometry](SphereGeometry.html) and other convex primitives can also be used.

Note: This lib adds member variables to object's userData member (see prepareBreakableObject function) Use with caution and read the code when using with other libs.

## Import

ConvexObjectBreaker is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ConvexObjectBreaker } from 'three/addons/misc/ConvexObjectBreaker.js';
```

## Constructor

### new ConvexObjectBreaker( minSizeForBreak : number, smallDelta : number )

Constructs a new convex object breaker.

**minSizeForBreak**

Min size a debris can have to break.

Default is `1.4`.

**smallDelta**

Max distance to consider that a point belongs to a plane.

Default is `0.0001`.

## Methods

### .cutByPlane( object : Object3D, plane : Plane, output : Object ) : number

Subdivides the given 3D object into pieces by a plane.

**object**

The 3D object to subdivide.

**plane**

The plane to cut the 3D object.

**output**

An object that stores the pieces.

**Returns:** The number of pieces.

### .prepareBreakableObject( object : Object3D, mass : number, velocity : Vector3, angularVelocity : Vector3, breakable : boolean )

Must be called for all 3D objects that should be breakable.

**object**

The 3D object. It must have a convex geometry.

**mass**

The 3D object's mass in kg. Must be greater than `0`.

**velocity**

The 3D object's velocity.

**angularVelocity**

The 3D object's angular velocity.

**breakable**

Whether the 3D object is breakable or not.

### .subdivideByImpact( object : Object3D, pointOfImpact : Vector3, normal : Vector3, maxRadialIterations : number, maxRandomIterations : number ) : Array.<Object3D>

Subdivides the given 3D object into pieces by an impact (meaning another object hits the given 3D object at a certain surface point).

**object**

The 3D object to subdivide.

**pointOfImpact**

The point of impact.

**normal**

The impact normal.

**maxRadialIterations**

Iterations for radial cuts.

**maxRandomIterations**

Max random iterations for not-radial cuts.

**Returns:** The array of pieces.

## Source

[examples/jsm/misc/ConvexObjectBreaker.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/ConvexObjectBreaker.js)