*Inheritance: Pass →*

# RenderPass

This class represents a render pass. It takes a camera and a scene and produces a beauty pass for subsequent post processing effects.

## Code Example

```js
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
```

## Import

RenderPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
```

## Constructor

### new RenderPass( scene : Scene, camera : Camera, overrideMaterial : Material, clearColor : number | Color | string, clearAlpha : number )

Constructs a new render pass.

**scene**

The scene to render.

**camera**

The camera.

**overrideMaterial**

The override material. If set, this material is used for all objects in the scene.

Default is `null`.

**clearColor**

The clear color of the render pass.

Default is `null`.

**clearAlpha**

The clear alpha of the render pass.

Default is `null`.

## Properties

### .camera : Camera

The camera.

### .clear : boolean

Overwritten to perform a clear operation by default.

Default is `true`.

**Overrides:** [Pass#clear](Pass.html#clear)

### .clearAlpha : number

The clear alpha of the render pass.

Default is `null`.

### .clearColor : number | Color | string

The clear color of the render pass.

Default is `null`.

### .clearDepth : boolean

If set to `true`, only the depth can be cleared when `clear` is to `false`.

Default is `false`.

### .isRenderPass : boolean (readonly)

This flag indicates that this pass renders the scene itself.

Default is `true`.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .overrideMaterial : Material

The override material. If set, this material is used for all objects in the scene.

Default is `null`.

### .scene : Scene

The scene to render.

## Methods

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs a beauty pass with the configured scene and camera.

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

[examples/jsm/postprocessing/RenderPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/RenderPass.js)