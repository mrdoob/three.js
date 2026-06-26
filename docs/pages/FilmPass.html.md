*Inheritance: Pass →*

# FilmPass

This pass can be used to create a film grain effect.

## Code Example

```js
const filmPass = new FilmPass();
composer.addPass( filmPass );
```

## Import

FilmPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
```

## Constructor

### new FilmPass( intensity : number, grayscale : boolean )

Constructs a new film pass.

**intensity**

The grain intensity in the range `[0,1]` (0 = no effect, 1 = full effect).

Default is `0.5`.

**grayscale**

Whether to apply a grayscale effect or not.

Default is `false`.

## Properties

### .material : ShaderMaterial

The pass material.

### .uniforms : Object

The pass uniforms. Use this object if you want to update the `intensity` or `grayscale` values at runtime.

```js
pass.uniforms.intensity.value = 1;
pass.uniforms.grayscale.value = true;
```

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the film pass.

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

[examples/jsm/postprocessing/FilmPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/FilmPass.js)