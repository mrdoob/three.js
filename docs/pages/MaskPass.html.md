*Inheritance: Pass →*

# MaskPass

This pass can be used to define a mask during post processing. Meaning only areas of subsequent post processing are affected which lie in the masking area of this pass. Internally, the masking is implemented with the stencil buffer.

## Code Example

```js
const maskPass = new MaskPass( scene, camera );
composer.addPass( maskPass );
```

## Import

MaskPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MaskPass } from 'three/addons/postprocessing/MaskPass.js';
```

## Constructor

### new MaskPass( scene : Scene, camera : Camera )

Constructs a new mask pass.

**scene**

The 3D objects in this scene will define the mask.

**camera**

The camera.

## Properties

### .camera : Camera

The camera.

### .clear : boolean

Overwritten to perform a clear operation by default.

Default is `true`.

**Overrides:** [Pass#clear](Pass.html#clear)

### .inverse : boolean

Whether to inverse the mask or not.

Default is `false`.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .scene : Scene

The scene that defines the mask.

## Methods

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs a mask pass with the configured scene and camera.

**renderer**

The renderer.

**writeBuffer**

The write buffer. This buffer is intended as the rendering destination for the pass.

**readBuffer**

The read buffer. The pass can access the result from the previous pass from this buffer.

**deltaTime**

The delta time in seconds.

**maskActive**

Whether masking is active or not.

**Overrides:** [Pass#render](Pass.html#render)

## Source

[examples/jsm/postprocessing/MaskPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/MaskPass.js)