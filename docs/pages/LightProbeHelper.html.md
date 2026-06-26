*Inheritance: EventDispatcher → Object3D → Mesh →*

# LightProbeHelper

Renders a sphere to visualize a light probe in the scene.

This helper can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), import from `LightProbeHelperGPU.js`.

## Code Example

```js
const helper = new LightProbeHelper( lightProbe );
scene.add( helper );
```

## Import

LightProbeHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js';
```

## Constructor

### new LightProbeHelper( lightProbe : LightProbe, size : number )

Constructs a new light probe helper.

**lightProbe**

The light probe to visualize.

**size**

The size of the helper.

Default is `1`.

## Properties

### .lightProbe : LightProbe

The light probe to visualize.

### .size : number

The size of the helper.

Default is `1`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

## Source

[examples/jsm/helpers/LightProbeHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/LightProbeHelper.js)