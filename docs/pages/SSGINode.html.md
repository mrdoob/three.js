*Inheritance: EventDispatcher → Node → TempNode →*

# SSGINode

Post processing node for applying Screen Space Global Illumination (SSGI) to a scene.

References:

*   [https://github.com/cdrinmatane/SSRT3](https://github.com/cdrinmatane/SSRT3).
*   [https://cdrinmatane.github.io/posts/ssaovb-code/](https://cdrinmatane.github.io/posts/ssaovb-code/).
*   [https://cdrinmatane.github.io/cgspotlight-slides/ssilvb\_slides.pdf](https://cdrinmatane.github.io/cgspotlight-slides/ssilvb_slides.pdf).

The quality and performance of the effect mainly depend on `sliceCount` and `stepCount`. The total number of samples taken per pixel is `sliceCount` \* `stepCount` \* `2`. Here are some recommended presets depending on whether temporal filtering is used or not.

With temporal filtering (recommended):

*   Low: `sliceCount` of `1`, `stepCount` of `12`.
*   Medium: `sliceCount` of `2`, `stepCount` of `8`.
*   High: `sliceCount` of `3`, `stepCount` of `16`.

Use for a higher slice count if you notice temporal instabilities like flickering. Reduce the sample count then to mitigate the performance lost.

Without temporal filtering:

*   Low: `sliceCount` of `2`, `stepCount` of `6`.
*   Medium: `sliceCount` of `3`, `stepCount` of `8`.
*   High: `sliceCount` of `4`, `stepCount` of `12`.

## Import

SSGINode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ssgi } from 'three/addons/tsl/display/SSGINode.js';
```

## Constructor

### new SSGINode( beautyNode : TextureNode, depthNode : TextureNode, normalNode : TextureNode, camera : PerspectiveCamera )

Constructs a new SSGI node.

**beautyNode**

A texture node that represents the beauty or scene pass.

**depthNode**

A texture node that represents the scene's depth.

**normalNode**

A texture node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

## Properties

### .aoIntensity : UniformNode.<float>

Power function applied to AO to make it appear darker/lighter. Should be in the range `[0, 4]`.

Default is `1`.

### .backfaceLighting : UniformNode.<float>

How much light backface surfaces emit. Should be in the range `[0, 1]`.

Default is `0`.

### .beautyNode : TextureNode

A texture node that represents the beauty or scene pass.

### .depthNode : TextureNode

A node that represents the scene's depth.

### .expFactor : UniformNode.<float>

Controls samples distribution. It's an exponent applied at each step get increasing step size over the distance. Should be in the range `[1, 3]`.

Default is `2`.

### .giIntensity : UniformNode.<float>

Intensity of the indirect diffuse light. Should be in the range `[0, 100]`.

Default is `10`.

### .normalNode : TextureNode

A node that represents the scene's normals. If no normals are passed to the constructor (because MRT is not available), normals can be automatically reconstructed from depth values in the shader.

### .radius : UniformNode.<float>

Effective sampling radius in world space. AO and GI can only have influence within that radius. Should be in the range `[1, 25]`.

Default is `12`.

### .sliceCount : UniformNode.<uint>

Number of per-pixel hemisphere slices. This has a big performance cost and should be kept as low as possible. Should be in the range `[1, 4]`.

Default is `1`.

### .stepCount : UniformNode.<uint>

Number of samples taken along one side of a given hemisphere slice. This has a big performance cost and should be kept as low as possible. Should be in the range `[1, 32]`.

Default is `12`.

### .thickness : UniformNode.<float>

Constant thickness value of objects on the screen in world units. Allows light to pass behind surfaces past that thickness value. Should be in the range `[0.01, 10]`.

Default is `1`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .useLinearThickness : UniformNode.<bool>

Whether to increase thickness linearly over distance or not (avoid losing detail over the distance).

Default is `false`.

### .useScreenSpaceSampling : UniformNode.<bool>

Makes the sample distance in screen space instead of world-space (helps having more detail up close).

Default is `false`.

### .useTemporalFiltering : boolean

Whether to use temporal filtering or not. Setting this property to `true` requires the usage of `TRAANode`. This will help to reduce noise although it introduces typical TAA artifacts like ghosting and temporal instabilities.

If setting this property to `false`, a manual denoise via `DenoiseNode` is required.

Default is `true`.

## Methods

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getTextureNode() : PassTextureNode

Returns the result of the effect as a texture node.

**Returns:** A texture node that represents the result of the effect.

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

[examples/jsm/tsl/display/SSGINode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SSGINode.js)