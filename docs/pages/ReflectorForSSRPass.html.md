*Inheritance: EventDispatcher → Object3D → Mesh →*

# ReflectorForSSRPass

A special version of [Reflector](Reflector.html) for usage with [SSRPass](SSRPass.html).

## Import

ReflectorForSSRPass is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ReflectorForSSRPass } from 'three/addons/objects/ReflectorForSSRPass.js';
```

## Constructor

### new ReflectorForSSRPass( geometry : BufferGeometry, options : ReflectorForSSRPass~Options )

Constructs a new reflector.

**geometry**

The reflector's geometry.

**options**

The configuration options.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .getRenderTarget() : WebGLRenderTarget

Returns the reflector's internal render target.

**Returns:** The internal render target

## Type Definitions

### .Options

Constructor options of `ReflectorForSSRPass`.

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

**useDepthTexture**  
boolean

Whether to store depth values in a texture or not.

Default is `true`.

**resolution**  
[Vector2](Vector2.html)

Resolution for the Reflector Pass.

## Source

[examples/jsm/objects/ReflectorForSSRPass.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/ReflectorForSSRPass.js)