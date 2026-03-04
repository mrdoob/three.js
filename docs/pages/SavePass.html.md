*Inheritance: Pass →*

# SavePass

A pass that saves the contents of the current read buffer in a render target.

## Code Example

```js
const savePass = new SavePass( customRenderTarget );
composer.addPass( savePass );
```

## Import

SavePass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SavePass } from 'three/addons/postprocessing/SavePass.js';
```

## Constructor

### new SavePass( renderTarget : WebGLRenderTarget )

Constructs a new save pass.

**renderTarget**

The render target for saving the read buffer. If not provided, the pass automatically creates a render target.

## Properties

### .material : ShaderMaterial

The pass material.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .renderTarget : WebGLRenderTarget

The render target which is used to save the read buffer.

### .uniforms : Object

The pass uniforms.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the save pass.

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

[examples/jsm/postprocessing/SavePass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SavePass.js)