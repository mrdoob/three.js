# Lightmapped Cornell Box

A procedural Cornell box with baked indirect lighting stored in a shared lightmap
atlas using `MOZ_lightmap`. A ceiling point light is stored using
`KHR_lights_punctual`.

Re-exported from `webgpu_lightbaking_cornell.html` using 64 indirect-diffuse
samples on an Apple Metal GPU. The eight meshes share a 1024 × 1024
sRGB-encoded lightmap on `TEXCOORD_1`, with HDR scale stored in the extension's
intensity. The scene includes a glossy blue sphere with dynamic direct lighting.

Created with Three.js. No external models or textures. Provided under the
repository's MIT license.
