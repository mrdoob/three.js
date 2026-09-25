# ImportanceSampledEnvironment

Manages a preprocessed HDR environment map (CDF textures, uniforms) and exposes TSL helpers for BRDF-direction lookups and MIS importance sampling.

## Constructor

### new ImportanceSampledEnvironment( importanceSampling : boolean )

**importanceSampling**

When `true`, builds luminance CDF tables and enables MIS env sampling.

Default is `false`.

See:

*   [https://github.com/gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)

## Methods

### .sampleEnvironmentBRDF( params : Object ) : Node.<vec3>

Environment reflection for a screen-space miss using only the BRDF / reflected-ray direction.

**params**

**cameraWorldMatrix**

**viewReflectDir**

View-space GGX-sampled reflected ray.

**N**

View-space shading normal.

**V**

View-space direction to camera.

**alpha**

GGX roughness (alpha).

**f0**

### .sampleEnvironmentMIS( params : Object ) : Node.<vec3>

Environment reflection for a screen-space miss, estimated with multiple importance sampling (MIS) between the BRDF / reflected-ray direction and the env-luminance CDF direction. Both techniques use consistent solid-angle PDFs (`D·G1(N·V)/(4·N·V)`), so the power heuristic is unbiased. Adapted from three-gpu-pathtracer.

**params**

**cameraWorldMatrix**

**viewReflectDir**

View-space GGX-sampled reflected ray.

**N**

View-space shading normal.

**V**

View-space direction to camera.

**alpha**

GGX roughness (alpha).

**f0**

**Xi2**

Second blue-noise sample (zw used for the CDF).

See:

*   [https://github.com/gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)

### .sampleReflect( params : Object ) : Node.<vec3>

Simple environment lookup along the reflected direction (no MIS).

**params**

**cameraWorldMatrix**

**viewReflectDir**

**sampleWeight**

Optional radiance scale (defaults to 1).

### .updateFrom( hdr : Texture )

**hdr**

Equirectangular HDR environment map.

## Source

[examples/jsm/tsl/display/ImportanceSampledEnvironment.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/ImportanceSampledEnvironment.js)