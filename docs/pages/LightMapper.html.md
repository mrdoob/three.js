# LightMapper

Bakes indirect diffuse irradiance into a light map. The irradiance is defined by a function that returns a TSL node for a world-space position and normal, so any global illumination technique can be baked, e.g. a [LightProbeGrid](LightProbeGrid.html) via `lightProbeGridIrradiance()` or a prepared [VXGIVolume](VXGIVolume.html) via `vxgiIrradiance()`.

Meshes need light map UVs in the `uv1` attribute, e.g. generated with [unwrapUVs](global.html#unwrapUVs). Each sample rasterizes the meshes in UV space with a sub-texel jitter and accumulates the result. The function also receives the sample index, so stochastic sources like `vxgiIrradiance()` can vary their samples and converge as they accumulate. Call `update()` once per frame to bake progressively, or pass a sample count to bake at once. Bake at most 256 samples, since samples accumulate in half float precision. Keep the source geometry and GI data static while accumulating. Call `reset()` after changing transforms or lighting. Atlas charts need at least three texels of padding; the resolve fills two texels around covered surfaces. Irradiance uses linear BT.709/sRGB primaries in lux. Do not include material ambient occlusion, base color, or exposure in the source irradiance. Material occlusion is applied once at runtime. Keep any contributions included in the bake out of runtime diffuse lighting to avoid counting them twice.

This class can only be used with [WebGPURenderer](WebGPURenderer.html).

## Code Example

```js
const lightMapper = new LightMapper( renderer, size, ( position, normal ) => lightProbeGridIrradiance( probes, position, normal ) );
lightMapper.addObjects( meshes );
lightMapper.update( 16 );
material.lightMap = lightMapper.texture;
```

## Import

LightMapper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { LightMapper } from 'three/addons/lighting/LightMapper.js';
```

## Constructor

### new LightMapper( renderer : WebGPURenderer, size : number, irradianceNode : function, options : Object )

Constructs a new light mapper.

**renderer**

The renderer.

**size**

The light map size in texels.

**irradianceNode**

Returns the irradiance for a world-space position, normal and sample index.

**options**

Bake options.

**lights**

Direct lights to include in the diffuse bake. Render their shadows in the source scene first and disable shadow updates during the UV bake.

Default is `[]`.

## Properties

### .irradianceNode : function

The source of indirect irradiance.

### .renderer : WebGPURenderer

The renderer.

### .samples : number (readonly)

The number of accumulated samples.

Default is `0`.

### .size : number

The light map size in texels.

### .texture : Texture

The baked light map. It stores linear diffuse irradiance in lux, without baked albedo, material ambient occlusion, or display exposure, and uses `uv1`. Values are not divided by pi, matching the runtime light map input.

## Methods

### .addObjects( objects : Array.<Mesh> )

Adds meshes to the light map. Their geometries must provide `uv1`. Skinned and instanced meshes are not supported.

**objects**

The meshes to add.

### .dispose()

Frees all internal resources.

### .reset()

Discards the accumulated samples.

### .update( samples : number )

Accumulates samples into the light map.

**samples**

The number of samples to add.

Default is `1`.

## Source

[examples/jsm/lighting/LightMapper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/LightMapper.js)