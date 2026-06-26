*Inheritance: Pass →*

# SSAARenderPass

Supersample Anti-Aliasing Render Pass.

This manual approach to SSAA re-renders the scene ones for each sample with camera jitter and accumulates the results.

## Code Example

```js
const ssaaRenderPass = new SSAARenderPass( scene, camera );
ssaaRenderPass.sampleLevel = 3;
composer.addPass( ssaaRenderPass );
```

## Import

SSAARenderPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';
```

## Constructor

### new SSAARenderPass( scene : Scene, camera : Camera, clearColor : number | Color | string, clearAlpha : number )

Constructs a new SSAA render pass.

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

### .camera : Camera

The camera.

### .clearAlpha : number

The clear alpha of the render pass.

Default is `0`.

### .clearColor : number | Color | string

The clear color of the render pass.

Default is `0x000000`.

### .sampleLevel : number

The sample level. Specified as n, where the number of samples is 2^n, so sampleLevel = 4, is 2^4 samples, 16.

Default is `4`.

### .scene : Scene

The scene to render.

### .stencilBuffer : boolean

Whether to use a stencil buffer or not. This property can't be changed after the first render.

Default is `false`.

### .unbiased : boolean

Whether the pass should be unbiased or not. This property has the most visible effect when rendering to a RGBA8 buffer because it mitigates rounding errors. By default RGBA16F is used.

Default is `true`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the SSAA render pass.

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

### .setSize( width : number, height : number )

Sets the size of the pass.

**width**

The width to set.

**height**

The height to set.

**Overrides:** [Pass#setSize](Pass.html#setSize)

## Source

[examples/jsm/postprocessing/SSAARenderPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SSAARenderPass.js)