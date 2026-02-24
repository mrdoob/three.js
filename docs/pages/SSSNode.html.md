*Inheritance: EventDispatcher → Node → TempNode →*

# SSSNode

Post processing node for applying Screen-Space Shadows (SSS) to a scene.

Screen-Space Shadows (also known as Contact Shadows) should ideally be used to complement traditional shadow maps. They are best suited for rendering detailed shadows of smaller objects at a closer scale like intricate shadowing on highly detailed models. In other words: Use Shadow Maps for the foundation and Screen-Space Shadows for the details.

The shadows produced by this implementation might have too hard edges for certain use cases. Use a box, gaussian or hash blur to soften the edges before doing the composite with the beauty pass. Code example:

Limitations:

*   Ideally the maximum shadow length should not exceed `1` meter. Otherwise the effect gets computationally very expensive since more samples during the ray marching process are evaluated. You can mitigate this issue by reducing the `quality` paramter.
*   The effect can only be used with a single directional light, the main light of your scene. This main light usually represents the sun or daylight.
*   Like other Screen-Space techniques SSS can only honor objects in the shadowing computation that are currently visible within the camera's view.

References:

*   [https://panoskarabelas.com/posts/screen\_space\_shadows/](https://panoskarabelas.com/posts/screen_space_shadows/).
*   [https://www.bendstudio.com/blog/inside-bend-screen-space-shadows/](https://www.bendstudio.com/blog/inside-bend-screen-space-shadows/).

## Code Example

```js
const sssPass = sss( scenePassDepth, camera, mainLight );
const sssBlur = boxBlur( sssPass.r, { size: 2, separation: 1 } ); // optional blur
```

## Import

SSSNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { sss } from 'three/addons/tsl/display/SSSNode.js';
```

## Constructor

### new SSSNode( depthNode : TextureNode, camera : Camera, mainLight : DirectionalLight )

Constructs a new SSS node.

**depthNode**

A texture node that represents the scene's depth.

**camera**

The camera the scene is rendered with.

**mainLight**

The main directional light of the scene.

## Properties

### .depthNode : TextureNode

A node that represents the beauty pass's depth.

### .maxDistance : UniformNode.<float>

Maximum shadow length in world units. Longer shadows result in more computational overhead.

Default is `0.1`.

### .quality : UniformNode.<float>

This parameter controls how detailed the raymarching process works. The value ranges is `[0,1]` where `1` means best quality (the maximum number of raymarching iterations/samples) and `0` means no samples at all.

A quality of `0.5` is usually sufficient for most use cases. Try to keep this parameter as low as possible. Larger values result in noticeable more overhead.

Default is `0.5`.

### .resolutionScale : number

The resolution scale. Valid values are in the range `[0,1]`. `1` means best quality but also results in more computational overhead. Setting to `0.5` means the effect is computed in half-resolution.

Default is `1`.

### .shadowIntensity : UniformNode.<float>

Shadow intensity. Must be in the range `[0, 1]`.

Default is `1.0`.

### .thickness : UniformNode.<float>

Depth testing thickness.

Default is `0.01`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .useTemporalFiltering : boolean

Whether to use temporal filtering or not. Setting this property to `true` requires the usage of `TRAANode`. This will help to reduce noice although it introduces typical TAA artifacts like ghosting and temporal instabilities.

Default is `false`.

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

[examples/jsm/tsl/display/SSSNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SSSNode.js)