*Inheritance: Pass →*

# SAOPass

A SAO implementation inspired from @bhouston previous SAO work.

`SAOPass` provides better quality than [SSAOPass](SSAOPass.html) but is also more expensive.

## Code Example

```js
const saoPass = new SAOPass( scene, camera );
composer.addPass( saoPass );
```

## Import

SAOPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
```

## Constructor

### new SAOPass( scene : Scene, camera : Camera, resolution : Vector2 )

Constructs a new SAO pass.

**scene**

The scene to compute the AO for.

**camera**

The camera.

**resolution**

The effect's resolution.

## Properties

### .camera : Camera

The camera.

### .clear : boolean

Overwritten to perform a clear operation by default.

Default is `true`.

**Overrides:** [Pass#clear](Pass.html#clear)

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .params : Object

The SAO parameter.

### .resolution : Vector2

The effect's resolution.

Default is `(256,256)`.

### .scene : Scene

The scene to render the AO for.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the SAO pass.

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

[examples/jsm/postprocessing/SAOPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SAOPass.js)