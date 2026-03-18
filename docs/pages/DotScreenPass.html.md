*Inheritance: Pass →*

# DotScreenPass

Pass for creating a dot-screen effect.

## Code Example

```js
const pass = new DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.8 );
composer.addPass( pass );
```

## Import

DotScreenPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
```

## Constructor

### new DotScreenPass( center : Vector2, angle : number, scale : number )

Constructs a new dot screen pass.

**center**

The center point.

**angle**

The rotation of the effect in radians.

**scale**

The scale of the effect. A higher value means smaller dots.

## Properties

### .material : ShaderMaterial

The pass material.

### .uniforms : Object

The pass uniforms. Use this object if you want to update the `center`, `angle` or `scale` values at runtime.

```js
pass.uniforms.center.value.copy( center );
pass.uniforms.angle.value = 0;
pass.uniforms.scale.value = 0.5;
```

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the dot screen pass.

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

[examples/jsm/postprocessing/DotScreenPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/DotScreenPass.js)