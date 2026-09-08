*Inheritance: EventDispatcher → Object3D → Light →*

# SunLight

A sun-like light that gets emitted in a specific direction, with rays that are all parallel, and casts cascaded shadow maps via [SunLightShadow](SunLightShadow.html), suited for lighting large scenes.

Unlike [DirectionalLight](DirectionalLight.html), the light has no target: like [HemisphereLight](HemisphereLight.html), its direction is defined by its position. The light shines from its position towards the origin and points straight down by default.

```js
const sun = new SunLight( 0xfff2e3, 3 );
sun.position.set( 1, 1, 1 );
sun.castShadow = true;
scene.add( sun );
```

When used with `WebGPURenderer`, the light must be registered with the renderer's node library first:

```js
renderer.library.addLight( SunLightNode, SunLight );
```

## Import

SunLight is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { SunLight } from 'three/addons/lights/SunLight.js';
```

## Constructor

### new SunLight( color : number | Color | string, intensity : number )

Constructs a new sun light.

**color**

The light's color.

Default is `0xffffff`.

**intensity**

The light's strength/intensity.

Default is `1`.

## Properties

### .isSunLight : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .shadow : SunLightShadow

This property holds the light's shadow configuration.

## Source

[examples/jsm/lights/SunLight.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lights/SunLight.js)