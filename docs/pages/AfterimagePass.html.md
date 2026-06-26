*Inheritance: Pass →*

# AfterimagePass

Pass for a basic after image effect.

## Code Example

```js
const afterimagePass = new AfterimagePass( 0.9 );
composer.addPass( afterimagePass );
```

## Import

AfterimagePass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
```

## Constructor

### new AfterimagePass( damp : number )

Constructs a new after image pass.

**damp**

The damping intensity. A higher value means a stronger after image effect.

Default is `0.96`.

## Properties

### .compFsMaterial : ShaderMaterial

The composition material.

### .copyFsMaterial : ShaderMaterial

The copy material.

### .damp : number

The damping intensity, from 0.0 to 1.0. A higher value means a stronger after image effect.

### .uniforms : Object

The pass uniforms. Use this object if you want to update the `damp` value at runtime.

```js
pass.uniforms.damp.value = 0.9;
```

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the after image pass.

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

[examples/jsm/postprocessing/AfterimagePass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/AfterimagePass.js)