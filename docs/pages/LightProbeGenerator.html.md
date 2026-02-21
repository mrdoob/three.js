# LightProbeGenerator

Utility class for creating instances of [LightProbe](LightProbe.html).

## Import

LightProbeGenerator is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
```

## Static Methods

### .fromCubeRenderTarget( renderer : WebGPURenderer | WebGLRenderer, cubeRenderTarget : CubeRenderTarget | WebGLCubeRenderTarget ) : Promise.<LightProbe> (async)

Creates a light probe from the given (radiance) environment map. The method expects that the environment map is represented as a cube render target.

The cube render target must be in RGBA so `cubeRenderTarget.texture.format` must be set to [RGBAFormat](global.html#RGBAFormat).

**renderer**

The renderer.

**cubeRenderTarget**

The environment map.

**Returns:** A Promise that resolves with the created light probe.

### .fromCubeTexture( cubeTexture : CubeTexture ) : LightProbe

Creates a light probe from the given (radiance) environment map. The method expects that the environment map is represented as a cube texture.

**cubeTexture**

The environment map.

**Returns:** The created light probe.

## Source

[examples/jsm/lights/LightProbeGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lights/LightProbeGenerator.js)