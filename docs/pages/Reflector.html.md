*Inheritance: EventDispatcher → Object3D → Mesh →*

# Reflector

Can be used to create a flat, reflective surface like a mirror.

Note that this class can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), use [ReflectorNode](ReflectorNode.html).

## Code Example

```js
const geometry = new THREE.PlaneGeometry( 100, 100 );
const reflector = new Reflector( geometry, {
	clipBias: 0.003,
	textureWidth: window.innerWidth * window.devicePixelRatio,
	textureHeight: window.innerHeight * window.devicePixelRatio,
	color: 0xc1cbcb
} );
scene.add( reflector );
```

## Import

Reflector is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Reflector } from 'three/addons/objects/Reflector.js';
```

## Constructor

### new Reflector( geometry : BufferGeometry, options : Reflector~Options )

Constructs a new reflector.

**geometry**

The reflector's geometry.

**options**

The configuration options.

## Properties

### .camera : PerspectiveCamera

The reflector's virtual camera. This is used to render the scene from the mirror's point of view.

### .forceUpdate : boolean

Whether to force an update, no matter if the reflector is in view or not.

Default is `false`.

### .isReflector : boolean (readonly)

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

Constructor options of `Reflector`.

**color**  
number | [Color](Color.html) | string

The reflector's color.

Default is `0x7F7F7F`.

**textureWidth**  
number

The texture width. A higher value results in more clear reflections but is also more expensive.

Default is `512`.

**textureHeight**  
number

The texture height. A higher value results in more clear reflections but is also more expensive.

Default is `512`.

**clipBias**  
number

The clip bias.

Default is `0`.

**shader**  
Object

Can be used to pass in a custom shader that defines how the reflective view is projected onto the reflector's geometry.

**multisample**  
number

How many samples to use for MSAA. `0` disables MSAA.

Default is `4`.

## Source

[examples/jsm/objects/Reflector.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Reflector.js)