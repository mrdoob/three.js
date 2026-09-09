*Inheritance: EventDispatcher → Node → TempNode →*

# VXGINode

Post processing node for voxel based global illumination. The scene is voxelized into a [VXGIVolume](VXGIVolume.html) and indirect diffuse light and ambient occlusion are gathered per pixel with approximate voxel cone tracing.

The node is a middle path between SSGI and Light Probe Grids:

*   Compared to `SSGINode` it is free of screen-space artifacts and provides noticeably more consistent lighting, since off-screen surfaces and thin occluders contribute. However, it is less dynamic: objects should stay static, because geometry changes require a re-voxelization (`needsUpdate = true`) which is too expensive for per-frame animation.
*   Compared to `LightProbeGrid` it supports dynamic lighting without a new baking process and produces a better overall lighting quality with less light bleeding. However, it is more expensive and therefore less suitable for performance restricted use cases.

The quality/performance of the effect mainly depend on the voxel resolution, the number of cones traced per pixel as well as the apeture of the cones.

Lights and their shadow maps are picked up automatically. Only direct lights are injected.

References:

*   [https://research.nvidia.com/publication/2011-09\_interactive-indirect-illumination-using-voxel-cone-tracing](https://research.nvidia.com/publication/2011-09_interactive-indirect-illumination-using-voxel-cone-tracing): Crassin et al., Interactive Indirect Illumination Using Voxel Cone Tracing, Pacific Graphics 2011.

Note: This node can only be used with `WebGPURenderer` and a WebGPU backend.

## Import

VXGINode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { vxgi } from 'three/addons/lighting/vxgi/VXGINode.js';
```

## Constructor

### new VXGINode( depthNode : TextureNode, normalNode : TextureNode, scene : Scene, camera : Camera, resolution : number )

Constructs a new voxel GI node.

**depthNode**

A texture node that represents the scene's depth.

**normalNode**

A texture node that represents the scene's view space normals.

**scene**

The scene to voxelize.

**camera**

The camera the scene is rendered with.

**resolution**

Number of voxels along the longest axis of the volume. Should not exceed `256`, higher values exceed the maximum storage buffer size of the voxelizer.

Default is `128`.

## Properties

### .aoDistance : UniformNode.<float>

Occlusion is weighted by `1 / ( 1 + distance / aoDistance )` for AO, so occluders at this world-space distance count half. `0` disables the falloff.

Default is `1`.

### .aoIntensity : UniformNode.<float>

Power function applied to AO to make it appear darker/lighter.

Default is `1`.

### .aoMinVisibility : UniformNode.<float>

The darkest value the ambient occlusion can reach. Lifts creases and contact regions out of pure black, which voxel-traced occlusion tends to overestimate at the resolution of a voxel. `0` keeps the full occlusion range.

Default is `0`.

### .bounces : number

Number of cached indirect bounces. See [VXGIVolume#bounces](VXGIVolume.html#bounces).

### .camera : Camera

The camera the scene is rendered with.

### .coneAngle : UniformNode.<float>

Aperture of the diffuse cones in degrees. Wider cones are faster (fewer steps) but leak and over-occlude more, narrow cones are more precise but noisier and take more steps. Choose it together with [VXGINode#coneCount](VXGINode.html#coneCount). Should be in the range `[10, 90]`.

Default is `40`.

### .coneCount : UniformNode.<uint>

Number of cones traced per pixel. Should be in the range `[2, 8]`.

Mainly defines the quality and precision of the Voxel Cone Tracing. A value of `2` - `4` is the recommended setting. Use `2` for performance restricted use cases.

Default is `3`.

### .debug : UniformNode.<int>

Debug visualization of the volume: `0` = off, `1` = radiance voxels, `2` = per-axis opacity voxels. The visualization replaces the GI output.

Default is `0`.

### .debugLevel : UniformNode.<float>

The mip level shown by the debug visualization.

Default is `0`.

### .depthNode : TextureNode

A node that represents the scene's depth.

### .directionalRadiance : boolean

Whether the coarser radiance levels are filtered directionally to reduce light bleeding through thin walls and floors. Off by default since it costs memory and performance. See [VXGIVolume#directionalRadiance](VXGIVolume.html#directionalRadiance).

### .giIntensity : UniformNode.<float>

Intensity of the indirect diffuse irradiance.

Default is `1`.

### .lightingNeedsUpdate : boolean

Set to `true` to re-inject lighting in the next frame.

### .needsUpdate : boolean

Set to `true` to re-voxelize the scene in the next frame.

**Overrides:** [TempNode#needsUpdate](TempNode.html#needsUpdate)

### .normalNode : TextureNode

A node that represents the scene's normals. If `null`, normals are reconstructed from depth.

### .normalOffset : UniformNode.<float>

Offset of the cone origins along the surface normal in voxels. The surface's own voxel can extend up to half a voxel above the surface and the trilinear footprint of a sample spans another half voxel, so 1.5 voxels avoid self-occlusion in every case.

Default is `1.5`.

### .scene : Scene

The scene to voxelize.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .useTemporalFiltering : boolean

Whether to use temporal filtering or not. Setting this property to `true` requires the usage of `TRAANode`. Cone directions are then rotated per frame to converge the noise.

Default is `true`.

### .volume : VXGIVolume

The voxel volume. Use it to configure bounds, layers and bounces.

## Methods

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getAONode() : PassTextureNode

Returns the AO result of the effect as a texture node.

**Returns:** A texture node that represents the AO result of the effect.

### .getGINode() : PassTextureNode

Returns the GI result of the effect as a texture node. The texture holds the indirect diffuse irradiance, ready to be added to the lighting via `builtinGIContext()`.

**Returns:** A texture node that represents the GI result of the effect.

### .setSize( width : number, height : number )

Sets the size of the effect.

**width**

The width of the effect.

**height**

The height of the effect.

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to render the effect once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/lighting/vxgi/VXGINode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/vxgi/VXGINode.js)