*Inheritance: Pass →*

# UnrealBloomPass

This pass is inspired by the bloom pass of Unreal Engine. It creates a mip map chain of bloom textures and blurs them with different radii. Because of the weighted combination of mips, and because larger blurs are done on higher mips, this effect provides good quality and performance.

When using this pass, tone mapping must be enabled in the renderer settings.

Reference:

*   [Bloom in Unreal Engine](https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/)

## Code Example

```js
const resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
const bloomPass = new UnrealBloomPass( resolution, 1.5, 0.4, 0.85 );
composer.addPass( bloomPass );
```

## Import

UnrealBloomPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
```

## Constructor

### new UnrealBloomPass( resolution : Vector2, strength : number, radius : number, threshold : number )

Constructs a new Unreal Bloom pass.

**resolution**

The effect's resolution.

**strength**

The Bloom strength.

Default is `1`.

**radius**

The Bloom radius.

**threshold**

The luminance threshold limits which bright areas contribute to the Bloom effect.

## Properties

### .clearColor : Color

The effect's clear color

Default is `(0,0,0)`.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .radius : number

The Bloom radius. Must be in the range `[0,1]`.

### .resolution : Vector2

The effect's resolution.

Default is `(256,256)`.

### .strength : number

The Bloom strength.

Default is `1`.

### .threshold : number

The luminance threshold limits which bright areas contribute to the Bloom effect.

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

[examples/jsm/postprocessing/UnrealBloomPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/UnrealBloomPass.js)