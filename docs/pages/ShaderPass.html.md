*Inheritance: Pass →*

# ShaderPass

This pass can be used to create a post processing effect with a raw GLSL shader object. Useful for implementing custom effects.

## Code Example

```js
const fxaaPass = new ShaderPass( FXAAShader );
composer.addPass( fxaaPass );
```

## Import

ShaderPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
```

## Constructor

### new ShaderPass( shader : Object | ShaderMaterial, textureID : string )

Constructs a new shader pass.

**shader**

A shader object holding vertex and fragment shader as well as defines and uniforms. It's also valid to pass a custom shader material.

**textureID**

The name of the texture uniform that should sample the read buffer.

Default is `'tDiffuse'`.

## Properties

### .material : ShaderMaterial

The pass material.

### .textureID : string

The name of the texture uniform that should sample the read buffer.

Default is `'tDiffuse'`.

### .uniforms : Object

The pass uniforms.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the shader pass.

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

[examples/jsm/postprocessing/ShaderPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/ShaderPass.js)