# SoftParticles

## Import

SoftParticles is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { softParticles } from 'three/addons/tsl/utils/SoftParticles.js';
```

## Static Methods

### .softParticles( parameters : Object ) : Node.<float>

Computes an opacity node for soft particles, based on the "Soft Particles" white paper (NVIDIA, Tristan Lorach).

**parameters**

The configuration parameters.

Default is `{}`.

**opacity**

The sprite's base opacity, which the soft fade is multiplied with.

Default is `float(1)`.

**distance**

The world-space distance over which the sprite fades out against the scene.

Default is `1`.

**contrast**

The contrast power of the fade curve. `1` is linear, higher values sharpen the transition.

Default is `2`.

**viewportDepth**

The opaque scene depth the particles fade against.

Default is `viewportDepthTexture()`.

**Returns:** The opacity node to assign to `material.opacityNode`.

## Source

[examples/jsm/tsl/utils/SoftParticles.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/utils/SoftParticles.js)