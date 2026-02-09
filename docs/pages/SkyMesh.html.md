*Inheritance: EventDispatcher → Object3D → Mesh →*

# SkyMesh

Represents a skydome for scene backgrounds. Based on [A Practical Analytic Model for Daylight](https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight) aka The Preetham Model, the de facto standard for analytical skydomes.

Note that this class can only be used with [WebGPURenderer](WebGPURenderer.html). When using [WebGLRenderer](WebGLRenderer.html), use [Sky](Sky.html).

More references:

*   [http://simonwallner.at/project/atmospheric-scattering/](http://simonwallner.at/project/atmospheric-scattering/)
*   [http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR](http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR)

## Code Example

```js
const sky = new SkyMesh();
sky.scale.setScalar( 10000 );
scene.add( sky );
```

## Import

SkyMesh is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SkyMesh } from 'three/addons/objects/SkyMesh.js';
```

## Constructor

### new SkyMesh()

Constructs a new skydome.

## Properties

### .isSky : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

**Deprecated:** Use isSkyMesh instead.

### .isSkyMesh : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .mieCoefficient : UniformNode.<float>

The mieCoefficient uniform.

### .mieDirectionalG : UniformNode.<float>

The mieDirectionalG uniform.

### .rayleigh : UniformNode.<float>

The rayleigh uniform.

### .sunPosition : UniformNode.<vec3>

The sun position uniform.

### .turbidity : UniformNode.<float>

The turbidity uniform.

### .upUniform : UniformNode.<vec3>

The up position.

## Source

[examples/jsm/objects/SkyMesh.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/SkyMesh.js)