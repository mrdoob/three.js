*Inheritance: Pass →*

# HalftonePass

Pass for creating a RGB halftone effect.

## Code Example

```js
const params = {
	shape: 1,
	radius: 4,
	rotateR: Math.PI / 12,
	rotateB: Math.PI / 12 * 2,
	rotateG: Math.PI / 12 * 3,
	scatter: 0,
	blending: 1,
	blendingMode: 1,
	greyscale: false,
	disable: false
};
const halftonePass = new HalftonePass( params );
composer.addPass( halftonePass );
```

## Import

HalftonePass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
```

## Constructor

### new HalftonePass( params : Object )

Constructs a new halftone pass.

**params**

The halftone shader parameter.

## Properties

### .material : ShaderMaterial

The pass material.

### .uniforms : Object

The pass uniforms.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the halftone pass.

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

[examples/jsm/postprocessing/HalftonePass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/HalftonePass.js)