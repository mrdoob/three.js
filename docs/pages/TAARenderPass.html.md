*Inheritance: Pass → SSAARenderPass →*

# TAARenderPass

Temporal Anti-Aliasing Render Pass.

When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.

Note: This effect uses no reprojection so it is no TRAA implementation.

## Code Example

```js
const taaRenderPass = new TAARenderPass( scene, camera );
taaRenderPass.unbiased = false;
composer.addPass( taaRenderPass );
```

## Import

TAARenderPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TAARenderPass } from 'three/addons/postprocessing/TAARenderPass.js';
```

## Constructor

### new TAARenderPass( scene : Scene, camera : Camera, clearColor : number | Color | string, clearAlpha : number )

Constructs a new TAA render pass.

**scene**

The scene to render.

**camera**

The camera.

**clearColor**

The clear color of the render pass.

Default is `0x000000`.

**clearAlpha**

The clear alpha of the render pass.

Default is `0`.

## Properties

### .accumulate : boolean

Whether to accumulate frames or not. This enables the TAA.

Default is `false`.

### .accumulateIndex : number

The accumulation index.

Default is `-1`.

### .sampleLevel : number

Overwritten and set to 0 by default.

Default is `0`.

**Overrides:** [SSAARenderPass#sampleLevel](SSAARenderPass.html#sampleLevel)

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [SSAARenderPass#dispose](SSAARenderPass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the TAA render pass.

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

**Overrides:** [SSAARenderPass#render](SSAARenderPass.html#render)

## Source

[examples/jsm/postprocessing/TAARenderPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/TAARenderPass.js)