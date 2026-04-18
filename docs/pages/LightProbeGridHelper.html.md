*Inheritance: EventDispatcher → Object3D → Mesh → InstancedMesh →*

# LightProbeGridHelper

Visualizes an [LightProbeGrid](LightProbeGrid.html) by rendering a sphere at each probe position, shaded with the probe's L1 spherical harmonics.

Uses a single `InstancedMesh` draw call for all probes.

## Code Example

```js
const helper = new LightProbeGridHelper( probes );
scene.add( helper );
```

## Import

LightProbeGridHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LightProbeGridHelper } from 'three/addons/helpers/LightProbeGridHelper.js';
```

## Constructor

### new LightProbeGridHelper( probes : LightProbeGrid, sphereSize : number )

Constructs a new irradiance probe grid helper.

**probes**

The probe grid to visualize.

**sphereSize**

The radius of each probe sphere.

Default is `0.12`.

## Properties

### .probes : LightProbeGrid

The probe grid to visualize.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

**Overrides:** [InstancedMesh#dispose](InstancedMesh.html#dispose)

### .update()

Rebuilds instance matrices and UVW attributes from the current probe grid. Call this after changing `probes` or after re-baking.

## Source

[examples/jsm/helpers/LightProbeGridHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/LightProbeGridHelper.js)