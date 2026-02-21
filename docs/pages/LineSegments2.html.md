*Inheritance: EventDispatcher → Object3D → Mesh →*

# LineSegments2

A series of lines drawn between pairs of vertices.

This adds functionality beyond [LineSegments](LineSegments.html), like arbitrary line width and changing width to be in world units. [Line2](Line2.html) extends this object, forming a polyline instead of individual segments.

This module can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), import the class from `lines/webgpu/LineSegments2.js`.

## Code Example

```js
const geometry = new LineSegmentsGeometry();
geometry.setPositions( positions );
geometry.setColors( colors );
const material = new LineMaterial( { linewidth: 5, vertexColors: true } };
const lineSegments = new LineSegments2( geometry, material );
scene.add( lineSegments );
```

## Import

LineSegments2 is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
```

## Constructor

### new LineSegments2( geometry : LineSegmentsGeometry, material : LineMaterial )

Constructs a new wide line.

**geometry**

The line geometry.

**material**

The line material.

## Properties

### .isLineSegments2 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .computeLineDistances() : LineSegments2

Computes an array of distance values which are necessary for rendering dashed lines. For each vertex in the geometry, the method calculates the cumulative length from the current point to the very beginning of the line.

**Returns:** A reference to this instance.

### .raycast( raycaster : Raycaster, intersects : Array.<Object> )

Computes intersection points between a casted ray and this instance.

**raycaster**

The raycaster.

**intersects**

The target array that holds the intersection points.

**Overrides:** [Mesh#raycast](Mesh.html#raycast)

## Source

[examples/jsm/lines/LineSegments2.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lines/LineSegments2.js)