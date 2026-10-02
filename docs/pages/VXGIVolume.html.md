# VXGIVolume

Holds the voxel representation of a scene for [VXGINode](VXGINode.html): an anisotropic opacity mip chain, a direct radiance volume and a radiance volume with cached bounces.

The representation is a dense variant of the pre-filtered voxel hierarchy of Crassin et al. 2011 (a dense mip chain instead of a sparse octree, which keeps cone samples to two texture fetches): opacity stores visibility per major axis and is filtered directionally (volumetric integration along the axis, averaging across it), radiance is stored opacity-premultiplied and indirect bounces are cached in the volume via cone tracing. Only direct lights are injected. Voxelization uses conservative rasterization along the dominant triangle axis in a compute shader.

Direct light is injected per voxel instead of splatting photons from a light-view map as in the paper: the shadow maps rendered by the renderer are the light-view maps, and every occupied voxel pulls its visibility from them (2D maps for directional and spot lights, cube maps for point lights) and evaluates its irradiance analytically. This reuses the existing shadow passes, makes the injected shadows match the direct lighting exactly and needs neither atomics nor a normalization by photon density. Lights without a shadow map fall back to a visibility cone traced through the volume. The trade-off is a cost proportional to the number of occupied voxels times lights rather than to the light-view resolution, and that only outgoing diffuse radiance is stored (no incoming direction distribution for glossy cones).

References:

*   [https://research.nvidia.com/publication/2011-09\_interactive-indirect-illumination-using-voxel-cone-tracing](https://research.nvidia.com/publication/2011-09_interactive-indirect-illumination-using-voxel-cone-tracing): Crassin et al., Interactive Indirect Illumination Using Voxel Cone Tracing, Pacific Graphics 2011.
*   [https://developer.nvidia.com/content/basics-gpu-voxelization](https://developer.nvidia.com/content/basics-gpu-voxelization): Basics of GPU voxelization.

Note: This class can only be used with `WebGPURenderer` and a WebGPU backend.

## Import

VXGIVolume is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { VXGIVolume } from 'three/addons/lighting/vxgi/VXGIVolume.js';
```

## Constructor

### new VXGIVolume( resolution : number )

Constructs a new volume.

**resolution**

Number of voxels along the longest axis of the bounds. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.

Default is `128`.

## Properties

### .bounceConeAngle : UniformNode.<float>

Aperture of the cones used for the cached bounces in degrees.

Default is `60`.

### .bounces : number

Number of cached indirect bounces stored in the volume. Should be in the range `[0, 2]`.

Default is `1`.

### .bounds : Box3

The requested world-space bounds of the volume. If empty (the default), the bounds are computed from the scene at voxelization. See [VXGIVolume#worldBounds](VXGIVolume.html#worldBounds) for the effective bounds.

### .boundsMinNode : UniformNode.<vec3>

The minimum corner of the volume.

### .directionalNode : Texture3DNode

Texture node of [VXGIVolume#directionalTexture](VXGIVolume.html#directionalTexture). Stays valid across re-allocations of the volume.

### .directionalRadiance : boolean

Whether the coarser radiance levels are filtered directionally: along each axis the finer voxels are composited front to back using their surface normals, so a cone only gathers the surfaces facing it. This reduces light bleeding through thin walls and floors (e.g. a sunlit floor brightening the ceiling of the room below) at the cost of additional memory and a more expensive radiance lookup. Changing it triggers a re-voxelization.

Default is `false`.

### .directionalTexture : Storage3DTexture

The coarser radiance levels filtered directionally for the six directions a ray can travel (+x, -x, +y, -y, +z, -z), only allocated with [VXGIVolume#directionalRadiance](VXGIVolume.html#directionalRadiance). Each texel holds the radiance of the surfaces facing the direction premultiplied by their weight (`rgb`) and the weight (`a`); occlusion comes from the opacity mip chain. The six directions are stored side by side along x in one half-resolution mip chain; level `n` of the volume is its level `n - 1`.

### .directionalWidthNode : UniformNode.<float>

The width of one direction block of the directional texture in texels (at its level 0).

### .layers : Layers

Only meshes that pass this layer test are voxelized.

### .lightingNeedsUpdate : boolean

Set to `true` to re-inject lighting in the next update. Changes of the lights and of the injection parameters are detected automatically, so this is rarely needed.

Default is `true`.

### .maxDistance : UniformNode.<float>

Maximum cone length in world units. `0` means unbounded.

Default is `0`.

### .maxLevelNode : UniformNode.<float>

The highest valid mip level of the voxel textures.

### .maxLights : number

Maximum number of lights injected into the volume.

Default is `8`.

### .minOpacity : number

Triangles with a lower opacity are not voxelized.

Default is `0.1`.

### .needsUpdate : boolean

Set to `true` to re-voxelize the scene in the next update.

Default is `true`.

### .opacityNode : Texture3DNode

Texture node of [VXGIVolume#opacityTexture](VXGIVolume.html#opacityTexture). Stays valid across re-allocations of the volume.

### .opacityTexture : Storage3DTexture

The per-axis opacity of the scene (`xyz`) and the occupancy (`w`) as a mip chain.

### .radianceNode : Texture3DNode

Texture node of [VXGIVolume#radianceTexture](VXGIVolume.html#radianceTexture). Stays valid across re-allocations of the volume.

### .radianceTexture : Storage3DTexture

The radiance of the scene including cached bounces, premultiplied by occupancy, as a mip chain. With [VXGIVolume#directionalRadiance](VXGIVolume.html#directionalRadiance) only the finest level is used and the coarser levels live in [VXGIVolume#directionalTexture](VXGIVolume.html#directionalTexture).

### .resolution : number

Number of voxels along the longest axis of the bounds. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.

Default is `128`.

### .shadowConeAngle : UniformNode.<float>

Aperture in degrees of the visibility cones traced towards lights that do not provide a shadow map. Wider cones are cheaper but soften the injected shadows.

Default is `10`.

### .stepScale : UniformNode.<float>

Step size relative to the texel size of the sampled mip level.

Default is `0.5`.

### .traceDistanceNode : Node.<float>

The effective maximum cone length as a node.

### .volumeSizeNode : UniformNode.<vec3>

The size of the volume.

### .voxelSizeNode : UniformNode.<float>

The size of a voxel.

### .worldBounds : Box3 (readonly)

The effective world-space bounds of the voxel grid, updated at voxelization.

## Methods

### .dispose()

Frees internal resources.

### .update( renderer : Renderer, scene : Scene )

Updates the volume if required. Voxelizes the scene when `needsUpdate` is set and re-injects lighting when `lightingNeedsUpdate` is set or a light has changed.

**renderer**

The renderer.

**scene**

The scene.

## Source

[examples/jsm/lighting/vxgi/VXGIVolume.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/vxgi/VXGIVolume.js)