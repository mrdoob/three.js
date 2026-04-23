*Inheritance: Pass →*

# BloomPass

A pass for a basic Bloom effect.

[UnrealBloomPass](UnrealBloomPass.html) produces a more advanced Bloom but is also more expensive.

## Code Example

```js
const effectBloom = new BloomPass( 0.75 );
composer.addPass( effectBloom );
```

## Import

BloomPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
```

## Constructor

### new BloomPass( strength : number, kernelSize : number, sigma : number )

Constructs a new Bloom pass.

**strength**

The Bloom strength.

Default is `1`.

**kernelSize**

The kernel size.

Default is `25`.

**sigma**

The sigma.

Default is `4`.

## Properties

### .combineUniforms : Object

The combine pass uniforms.

### .convolutionUniforms : Object

The convolution pass uniforms.

### .materialCombine : ShaderMaterial

The combine pass material.

### .materialConvolution : ShaderMaterial

The convolution pass material.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the Bloom pass.

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

[examples/jsm/postprocessing/BloomPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/BloomPass.js)