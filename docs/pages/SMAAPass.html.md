*Inheritance: Pass →*

# SMAAPass

A pass for applying SMAA. Unlike [FXAAPass](FXAAPass.html), `SMAAPass` operates in `linear-srgb` so this pass must be executed before [OutputPass](OutputPass.html).

## Code Example

```js
const smaaPass = new SMAAPass();
composer.addPass( smaaPass );
```

## Import

SMAAPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
```

## Constructor

### new SMAAPass()

Constructs a new SMAA pass.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the SMAA pass.

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

[examples/jsm/postprocessing/SMAAPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SMAAPass.js)