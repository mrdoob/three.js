*Inheritance: Pass →*

# RenderPixelatedPass

A special type of render pass that produces a pixelated beauty pass.

## Code Example

```js
const renderPixelatedPass = new RenderPixelatedPass( 6, scene, camera );
composer.addPass( renderPixelatedPass );
```

## Import

RenderPixelatedPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
```

## Constructor

### new RenderPixelatedPass( pixelSize : number, scene : Scene, camera : Camera, options : Object )

Constructs a new render pixelated pass.

**pixelSize**

The effect's pixel size.

**scene**

The scene to render.

**camera**

The camera.

**options**

The pass options.

## Properties

### .camera : Camera

The camera.

### .depthEdgeStrength : number

The normal edge strength.

Default is `0.4`.

### .normalEdgeStrength : number

The normal edge strength.

Default is `0.3`.

### .pixelSize : number

The effect's pixel size.

### .pixelatedMaterial : ShaderMaterial

The pixelated material.

### .scene : Scene

The scene to render.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the pixelation pass.

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

### .setPixelSize( pixelSize : number )

Sets the effect's pixel size.

**pixelSize**

The pixel size to set.

### .setSize( width : number, height : number )

Sets the size of the pass.

**width**

The width to set.

**height**

The height to set.

**Overrides:** [Pass#setSize](Pass.html#setSize)

## Source

[examples/jsm/postprocessing/RenderPixelatedPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/RenderPixelatedPass.js)