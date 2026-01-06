*Inheritance: Pass →*

# SSRPass

A pass for a basic SSR effect.

## Code Example

```js
const ssrPass = new SSRPass( {
	renderer,
	scene,
	camera,
	width: innerWidth,
	height: innerHeight
} );
composer.addPass( ssrPass );
```

## Import

SSRPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
```

## Constructor

### new SSRPass( options : SSRPass~Options )

Constructs a new SSR pass.

**options**

The pass options.

## Properties

### .blur : boolean

Whether to blur reflections or not.

Default is `true`.

### .bouncing : boolean

Whether bouncing is enabled or not.

Default is `false`.

### .camera : Camera

The camera.

### .clear : boolean

Overwritten to perform a clear operation by default.

Default is `true`.

**Overrides:** [Pass#clear](Pass.html#clear)

### .distanceAttenuation : boolean

Whether to use distance attenuation or not.

Default is `true`.

### .fresnel : boolean

Whether to use fresnel or not.

Default is `true`.

### .groundReflector : ReflectorForSSRPass

The ground reflector.

Default is `0`.

### .height : number

The height of the effect.

Default is `512`.

### .infiniteThick : boolean

Whether to use infinite thickness or not.

Default is `false`.

### .maxDistance : number

Controls how far a fragment can reflect.

Default is `180`.

### .opacity : number

The opacity.

Default is `0.5`.

### .output : number

The output configuration.

Default is `0`.

### .renderer : WebGLRenderer

The renderer.

### .resolutionScale : number

The resolution scale. Valid values are in the range `[0,1]`. `1` means best quality but also results in more computational overhead. Setting to `0.5` means the effect is computed in half-resolution.

Default is `1`.

### .scene : Scene

The scene to render.

### .selective : boolean

Whether the pass is selective or not.

Default is `false`.

### .selects : Array.<Object3D>

Which 3D objects should be affected by SSR. If not set, the entire scene is affected.

Default is `null`.

### .thickness : number

Controls the cutoff between what counts as a possible reflection hit and what does not.

Default is `.018`.

### .width : number

The width of the effect.

Default is `512`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the pass is no longer used in your app.

**Overrides:** [Pass#dispose](Pass.html#dispose)

### .render( renderer : WebGLRenderer, writeBuffer : WebGLRenderTarget, readBuffer : WebGLRenderTarget, deltaTime : number, maskActive : boolean )

Performs the SSR pass.

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

Constructor options of `SSRPass`.

**renderer**  
[WebGLRenderer](WebGLRenderer.html)

The renderer.

**scene**  
[Scene](Scene.html)

The scene to render.

**camera**  
[Camera](Camera.html)

The camera.

**width**  
number

The width of the effect.

Default is `512`.

**height**  
number

The width of the effect.

Default is `512`.

**selects**  
Array.<[Object3D](Object3D.html)\>

Which 3D objects should be affected by SSR. If not set, the entire scene is affected.

Default is `null`.

**bouncing**  
boolean

Whether bouncing is enabled or not.

Default is `false`.

**groundReflector**  
[ReflectorForSSRPass](ReflectorForSSRPass.html)

A ground reflector.

Default is `null`.

## Source

[examples/jsm/postprocessing/SSRPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/SSRPass.js)