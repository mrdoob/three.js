*Inheritance: Pass →*

# GTAOPass

A pass for an GTAO effect.

`GTAOPass` provides better quality than [SSAOPass](SSAOPass.html) but is also more expensive.

## Code Example

```js
const gtaoPass = new GTAOPass( scene, camera, width, height );
gtaoPass.output = GTAOPass.OUTPUT.Denoise;
composer.addPass( gtaoPass );
```

## Import

GTAOPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
```

## Constructor

### new GTAOPass( scene : Scene, camera : Camera, width : number, height : number, parameters : Object, aoParameters : Object, pdParameters : Object )

Constructs a new GTAO pass.

**scene**

The scene to compute the AO for.

**camera**

The camera.

**width**

The width of the effect.

Default is `512`.

**height**

The height of the effect.

Default is `512`.

**parameters**

The pass parameters.

**aoParameters**

The AO parameters.

**pdParameters**

The denoise parameters.

## Properties

### .blendIntensity : number

The AO blend intensity.

Default is `1`.

### .camera : Camera

The camera.

### .clear : boolean

Overwritten to perform a clear operation by default.

Default is `true`.

**Overrides:** [Pass#clear](Pass.html#clear)

### .gtaoMap : Texture (readonly)

A texture holding the computed AO.

### .height : number

The height of the effect.

Default is `512`.

### .output : number

The output configuration.

Default is `0`.

### .pdRadiusExponent : number

The Poisson Denoise radius exponent.

Default is `2`.

### .pdRings : number

The number of Poisson Denoise rings.

Default is `2`.

### .pdSamples : number

The Poisson Denoise sample count.

Default is `16`.

### .scene : Scene

The scene to render the AO for.

### .width : number

The width of the effect.

Default is `512`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the GTAO pass.

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

### .setGBuffer( depthTexture : DepthTexture, normalTexture : DepthTexture )

Configures the GBuffer of this pass. If no arguments are passed, the pass creates an internal render target for holding depth and normal data.

**depthTexture**

The depth texture.

**normalTexture**

The normal texture.

### .setSceneClipBox( box : Box3 )

Configures the clip box of the GTAO shader with the given AABB.

**box**

The AABB enclosing the scene that should receive AO. When passing `null`, to clip box is used.

### .setSize( width : number, height : number )

Sets the size of the pass.

**width**

The width to set.

**height**

The height to set.

**Overrides:** [Pass#setSize](Pass.html#setSize)

### .updateGtaoMaterial( parameters : Object )

Updates the GTAO material from the given parameter object.

**parameters**

The GTAO material parameters.

### .updatePdMaterial( parameters : Object )

Updates the Denoise material from the given parameter object.

**parameters**

The denoise parameters.

## Source

[examples/jsm/postprocessing/GTAOPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/GTAOPass.js)