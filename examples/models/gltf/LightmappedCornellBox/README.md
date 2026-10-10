# Lightmapped Cornell Box

A procedural Cornell box made with Three.js planes, a box, and a strong blue sphere near the floor.
The asset is provided under the repository's MIT license and uses no external
models or textures.

The eight meshes have unique `TEXCOORD_1` coordinates in a shared 1024 × 1024
atlas. Five PBR materials reference the same embedded linear PNG through
`MOZ_lightmap`. The extension's intensity restores the atlas's HDR range.

The atlas contains baked indirect irradiance, including red/green color bleeding.
The GLB also stores the ceiling point light used during baking through
`KHR_lights_punctual`, with its original position, color, intensity, and range.
Lighting was baked on an Apple Metal GPU. No environment map is needed.

Register `GLTFLightMapLoaderExtension` before loading the asset. The
`webgpu_loader_gltf_lightmaps.html` example uses the glTF light for direct lighting
and shadows. The sphere has roughness 0.15 to demonstrate a dynamic specular
highlight. Its baked-lighting toggle removes only the indirect illumination.
Shadow settings are configured in the example because glTF does not store them.
