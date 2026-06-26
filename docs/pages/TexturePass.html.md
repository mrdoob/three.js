*Inheritance: Pass →*

# TexturePass

This pass can be used to render a texture over the entire screen.

## Code Example

```js
const texture = new THREE.TextureLoader().load( 'textures/2294472375_24a3b8ef46_o.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;
const texturePass = new TexturePass( texture );
composer.addPass( texturePass );
```

## Import

TexturePass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TexturePass } from 'three/addons/postprocessing/TexturePass.js';
```

## Constructor

### new TexturePass( map : Texture, opacity : number )

Constructs a new texture pass.

**map**

The texture to render.

**opacity**

The opacity.

Default is `1`.

## Properties

### .map : Texture

The texture to render.

### .material : ShaderMaterial

The pass material.

### .needsSwap : boolean

Overwritten to disable the swap.

Default is `false`.

**Overrides:** [Pass#needsSwap](Pass.html#needsSwap)

### .opacity : number

The opacity.

Default is `1`.

### .uniforms : Object

The pass uniforms.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the texture pass.

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

[examples/jsm/postprocessing/TexturePass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/TexturePass.js)