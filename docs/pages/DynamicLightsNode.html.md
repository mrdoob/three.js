*Inheritance: EventDispatcher → Node → LightsNode →*

# DynamicLightsNode

A custom version of `LightsNode` that batches supported analytic lights into uniform arrays and loops.

Unsupported lights, node lights, shadow-casting lights, and projected spot lights keep the default per-light path.

## Import

DynamicLightsNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DynamicLightsNode } from 'three/addons/tsl/lighting/DynamicLightsNode.js';
```

## Constructor

### new DynamicLightsNode( options : Object )

Constructs a new dynamic lights node.

**options**

Dynamic lighting configuration.

Default is `{}`.

**maxDirectionalLights**

Maximum number of batched directional lights.

Default is `8`.

**maxPointLights**

Maximum number of batched point lights.

Default is `16`.

**maxSpotLights**

Maximum number of batched spot lights.

Default is `16`.

**maxHemisphereLights**

Maximum number of batched hemisphere lights.

Default is `4`.

## Source

[examples/jsm/tsl/lighting/DynamicLightsNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/lighting/DynamicLightsNode.js)