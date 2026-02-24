*Inheritance: Pass →*

# BokehPass

Pass for creating depth of field (DOF) effect.

## Code Example

```js
const bokehPass = new BokehPass( scene, camera, {
	focus: 500
	aperture: 5,
	maxblur: 0.01
} );
composer.addPass( bokehPass );
```

## Import

BokehPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
```

## Constructor

### new BokehPass( scene : Scene, camera : Camera, params : BokehPass~Options )

Constructs a new Bokeh pass.

**scene**

The scene to render the DOF for.

**camera**

The camera.

**params**

The pass options.

## Properties

### .camera : Camera

The camera.

### .materialBokeh : ShaderMaterial

The pass bokeh material.

### .scene : Scene

The scene to render the DOF for.

### .uniforms : Object

The pass uniforms. Use this object if you want to update the `focus`, `aperture` or `maxblur` values at runtime.

```js
pass.uniforms.focus.value = focus;
pass.uniforms.aperture.value = aperture;
pass.uniforms.maxblur.value = maxblur;
```

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the Bokeh pass.

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

## Type Definitions

### .Options

Constructor options of `BokehPass`.

**focus**  
number

Defines the effect's focus which is the distance along the camera's look direction in world units.

Default is `1`.

**aperture**  
number

Defines the effect's aperture.

Default is `0.025`.

**maxblur**  
number

Defines the effect's maximum blur.

Default is `1`.

## Source

[examples/jsm/postprocessing/BokehPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/BokehPass.js)