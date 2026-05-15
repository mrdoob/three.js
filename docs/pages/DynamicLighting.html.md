*Inheritance: Lighting →*

# DynamicLighting

A custom lighting implementation that batches supported analytic lights into uniform arrays so light count changes do not recompile materials.

## Code Example

```js
const lighting = new DynamicLighting( { maxPointLights: 64 } );
renderer.lighting = lighting;
```

## Import

DynamicLighting is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DynamicLighting } from 'three/addons/lighting/DynamicLighting.js';
```

## Constructor

### new DynamicLighting( options : Object )

Constructs a new dynamic lighting system.

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

## Classes

[DynamicLighting](DynamicLighting.html)

## Methods

### .createNode( lights : Array.<Light> ) : DynamicLightsNode

Creates a new dynamic lights node for the given array of lights.

**lights**

The lights to bind to the node.

**Overrides:** [Lighting#createNode](Lighting.html#createNode)

**Returns:** The dynamic lights node.

### .getNode( scene : Scene ) : LightsNode

Returns a lights node for the given scene.

**scene**

The scene.

**Overrides:** [Lighting#getNode](Lighting.html#getNode)

**Returns:** The lights node.

## Source

[examples/jsm/lighting/DynamicLighting.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/DynamicLighting.js)