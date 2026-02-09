# AnaglyphEffect

A class that creates an anaglyph effect.

Note that this class can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), use [AnaglyphPassNode](AnaglyphPassNode.html).

## Import

AnaglyphEffect is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { AnaglyphEffect } from 'three/addons/effects/AnaglyphEffect.js';
```

## Constructor

### new AnaglyphEffect( renderer : WebGLRenderer, width : number, height : number )

Constructs a new anaglyph effect.

**renderer**

The renderer.

**width**

The width of the effect in physical pixels.

Default is `512`.

**height**

The height of the effect in physical pixels.

Default is `512`.

## Methods

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

### .render( scene : Object3D, camera : Camera )

When using this effect, this method should be called instead of the default [WebGLRenderer#render](WebGLRenderer.html#render).

**scene**

The scene to render.

**camera**

The camera.

### .setSize( width : number, height : number )

Resizes the effect.

**width**

The width of the effect in logical pixels.

**height**

The height of the effect in logical pixels.

## Source

[examples/jsm/effects/AnaglyphEffect.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/effects/AnaglyphEffect.js)