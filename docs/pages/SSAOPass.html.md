*Inheritance: Pass →*

# SSAOPass

A pass for a basic SSAO effect.

[SAOPass](SAOPass.html) and GTAPass produce a more advanced AO but are also more expensive.

## Code Example

```js
const ssaoPass = new SSAOPass( scene, camera, width, height );
composer.addPass( ssaoPass );
```

## Import

SSAOPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
```

## Constructor

### new SSAOPass( scene : Scene, camera : Camera, width : number, height : number, kernelSize : number )

Constructs a new SSAO pass.

**scene**

The scene to compute the AO for.

**camera**

The camera.

**width**

The width of the effect.

Default is `512`.

**height**

The height of the effect.

Default is `512`.

**kernelSize**

The kernel size.

Default is `32`.

## Properties

### .camera : Camera

The camera.

### .clear : boolean

Overwritten to perform a clear operation by default.

Default is `true`.

**Overrides:** [Pass#clear](Pass.html#clear)

### .height : number

The height of the effect.

Default is `512`.

### .kernelRadius : number

The kernel radius controls how wide the AO spreads.

Default is `8`.

### .maxDistance : number

Defines the maximum distance that should be affected by the AO.

Default is `0.1`.

### .minDistance : number

Defines the minimum distance that should be affected by the AO.

Default is `0.005`.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .output : number

The output configuration.

Default is `0`.

### .scene : Scene

The scene to render the AO for.

### .width : number

The width of the effect.

Default is `512`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the SSAO pass.

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

[examples/jsm/postprocessing/SSAOPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SSAOPass.js)