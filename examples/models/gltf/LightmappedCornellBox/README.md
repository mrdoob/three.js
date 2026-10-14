# Lightmapped Cornell Box

A procedural Cornell box with baked indirect lighting stored in a shared lightmap
atlas using the draft `KHR_lightmap` extension. A ceiling point light is stored using
`KHR_lights_punctual`.

Re-exported from `webgpu_lightmap_baking.html` using 64 VXGI indirect-diffuse
samples on an NVIDIA GeForce GTX 1050 WebGPU adapter. The eight meshes share a
1024 × 1024 linear PNG irradiance lightmap on `TEXCOORD_1`, with HDR scale stored
in the extension's intensity. The values are not divided by pi and contain no
base color or display exposure. The scene includes a glossy blue sphere with
dynamic direct lighting. The asset declares glTF 2.1 as required by the proposal.

The exported asset was reloaded with `GLTFLightMapLoaderExtension` on the same
hardware adapter. All eight meshes retained their linear lightmap, UV channel,
and intensity; the decoded PNG bytes matched the normalized bake exactly.

Created with Three.js. No external models or textures. Provided under the
repository's MIT license.
