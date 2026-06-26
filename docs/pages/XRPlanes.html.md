*Inheritance: EventDispatcher → Object3D →*

# XRPlanes

A utility class for the WebXR Plane Detection Module. If planes are detected by WebXR, this class will automatically add them as thin box meshes to the scene when below code snippet is used.

## Code Example

```js
const planes = new XRPlanes( renderer );
scene.add( planes );
```

## Import

XRPlanes is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { XRPlanes } from 'three/addons/webxr/XRPlanes.js';
```

## Constructor

### new XRPlanes( renderer : WebGLRenderer | WebGPURenderer )

Constructs a new XR plane container.

**renderer**

The renderer.

## Source

[examples/jsm/webxr/XRPlanes.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/XRPlanes.js)