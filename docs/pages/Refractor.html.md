*Inheritance: EventDispatcher → Object3D → Mesh →*

# Refractor

Can be used to create a flat, refractive surface like for special windows or water effects.

Note that this class can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), use [viewportSharedTexture](TSL.html#viewportSharedTexture).

## Code Example

```js
const geometry = new THREE.PlaneGeometry( 100, 100 );
const refractor = new Refractor( refractorGeometry, {
	color: 0xcbcbcb,
	textureWidth: 1024,
	textureHeight: 1024
} );
scene.add( refractor );
```

## Import

Refractor is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Refractor } from 'three/addons/objects/Refractor.js';
```

## Constructor

### new Refractor( geometry : BufferGeometry, options : Refractor~Options )

Constructs a new refractor.

**geometry**

The refractor's geometry.

**options**

The configuration options.

## Properties

### .camera : PerspectiveCamera

The reflector's virtual camera.

### .isRefractor : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .getRenderTarget() : WebGLRenderTarget

Returns the reflector's internal render target.

**Returns:** The internal render target

## Type Definitions

### .Options

Constructor options of `Refractor`.

**color**  
number | [Color](Color.html) | string

The refractor's color.

Default is `0x7F7F7F`.

**textureWidth**  
number

The texture width. A higher value results in more clear refractions but is also more expensive.

Default is `512`.

**textureHeight**  
number

The texture height. A higher value results in more clear refractions but is also more expensive.

Default is `512`.

**clipBias**  
number

The clip bias.

Default is `0`.

**shader**  
Object

Can be used to pass in a custom shader that defines how the refractive view is projected onto the reflector's geometry.

**multisample**  
number

How many samples to use for MSAA. `0` disables MSAA.

Default is `4`.

## Source

[examples/jsm/objects/Refractor.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Refractor.js)