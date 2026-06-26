*Inheritance: Pass →*

# OutputPass

This pass is responsible for including tone mapping and color space conversion into your pass chain. In most cases, this pass should be included at the end of each pass chain. If a pass requires sRGB input (e.g. like FXAA), the pass must follow `OutputPass` in the pass chain.

The tone mapping and color space settings are extracted from the renderer.

## Code Example

```js
const outputPass = new OutputPass();
composer.addPass( outputPass );
```

## Import

OutputPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
```

## Constructor

### new OutputPass()

Constructs a new output pass.

## Properties

### .isOutputPass : boolean (readonly)

This flag indicates that this is an output pass.

Default is `true`.

### .material : RawShaderMaterial

The pass material.

### .uniforms : Object

The pass uniforms.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the output pass.

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

[examples/jsm/postprocessing/OutputPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/OutputPass.js)