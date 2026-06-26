*Inheritance: EventDispatcher → Object3D → Mesh →*

# FullScreenQuad

This module is a helper for passes which need to render a full screen effect which is quite common in context of post processing.

The intended usage is to reuse a single full screen quad for rendering subsequent passes by just reassigning the `material` reference.

This module can only be used with [WebGLRenderer](WebGLRenderer.html).

## Import

FullScreenQuad is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
```

## Constructor

### new FullScreenQuad( material : Material )

Constructs a new full screen quad.

**material**

The material to render te full screen quad with.

## Properties

### .material : Material

The quad's material.

**Overrides:** [Mesh#material](Mesh.html#material)

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the instance is no longer used in your app.

### .render( renderer : WebGLRenderer )

Renders the full screen quad.

**renderer**

The renderer.

## Source

[examples/jsm/postprocessing/Pass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/Pass.js)