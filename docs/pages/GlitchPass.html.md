*Inheritance: Pass →*

# GlitchPass

Pass for creating a glitch effect.

## Code Example

```js
const glitchPass = new GlitchPass();
composer.addPass( glitchPass );
```

## Import

GlitchPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
```

## Constructor

### new GlitchPass( dt_size : number )

Constructs a new glitch pass.

**dt\_size**

The size of the displacement texture for digital glitch squares.

Default is `64`.

## Properties

### .goWild : boolean

Whether to noticeably increase the effect intensity or not.

Default is `false`.

### .material : ShaderMaterial

The pass material.

### .uniforms : Object

The pass uniforms.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the glitch pass.

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

[examples/jsm/postprocessing/GlitchPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/GlitchPass.js)