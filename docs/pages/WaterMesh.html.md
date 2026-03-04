*Inheritance: EventDispatcher → Object3D → Mesh →*

# WaterMesh

A basic flat, reflective water effect.

Note that this class can only be used with [WebGPURenderer](WebGPURenderer.html). When using [WebGLRenderer](WebGLRenderer.html), use [Water](Water.html).

References:

*   [Flat mirror for three.js](https://github.com/Slayvin)
*   [An implementation of water shader based on the flat mirror](https://home.adelphi.edu/~stemkoski/)
*   [Water shader explanations in WebGL](http://29a.ch/slides/2012/webglwater/)

## Import

WaterMesh is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { WaterMesh } from 'three/addons/objects/WaterMesh.js';
```

## Constructor

### new WaterMesh( geometry : BufferGeometry, options : WaterMesh~Options )

Constructs a new water mesh.

**geometry**

The water mesh's geometry.

**options**

The configuration options.

## Properties

### .alpha : UniformNode.<float>

The alpha value.

Default is `1`.

### .distortionScale : UniformNode.<float>

The distortion scale.

Default is `20`.

### .isWaterMesh : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .resolutionScale : number

The effect's resolution scale.

Default is `0.5`.

### .size : UniformNode.<float>

The size value.

Default is `1`.

### .sunColor : UniformNode.<color>

The sun color.

Default is `0xffffff`.

### .sunDirection : UniformNode.<vec3>

The sun direction.

Default is `(0.70707,0.70707,0.0)`.

### .waterColor : UniformNode.<color>

The water color.

Default is `0x7f7f7f`.

### .waterNormals : TextureNode

The water's normal map.

## Type Definitions

### .Options

Constructor options of `WaterMesh`.

**resolutionScale**  
number

The resolution scale.

Default is `0.5`.

**waterNormals**  
[Texture](Texture.html)

The water's normal map.

Default is `null`.

**alpha**  
number

The alpha value.

Default is `1`.

**size**  
number

The size value.

Default is `1`.

**sunColor**  
number | [Color](Color.html) | string

The sun color.

Default is `0xffffff`.

**sunDirection**  
[Vector3](Vector3.html)

The sun direction.

Default is `(0.70707,0.70707,0.0)`.

**waterColor**  
number | [Color](Color.html) | string

The water color.

Default is `0x7F7F7F`.

**distortionScale**  
number

The distortion scale.

Default is `20`.

## Source

[examples/jsm/objects/WaterMesh.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/WaterMesh.js)