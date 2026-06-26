*Inheritance: EventDispatcher → Object3D → Mesh →*

# Wireframe

A class for creating wireframes based on wide lines.

This module can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), import the class from `lines/webgpu/Wireframe.js`.

## Code Example

```js
const geometry = new THREE.IcosahedronGeometry();
const wireframeGeometry = new WireframeGeometry2( geo );
const wireframe = new Wireframe( wireframeGeometry, material );
scene.add( wireframe );
```

## Import

Wireframe is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Wireframe } from 'three/addons/lines/Wireframe.js';
```

## Constructor

### new Wireframe( geometry : LineSegmentsGeometry, material : LineMaterial )

Constructs a new wireframe.

**geometry**

The line geometry.

**material**

The line material.

## Properties

### .isWireframe : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .computeLineDistances() : Wireframe

Computes an array of distance values which are necessary for rendering dashed lines. For each vertex in the geometry, the method calculates the cumulative length from the current point to the very beginning of the line.

**Returns:** A reference to this instance.

## Source

[examples/jsm/lines/Wireframe.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lines/Wireframe.js)