*Inheritance: EventDispatcher → Node → TempNode →*

# SSRNode

Post processing node for computing screen space reflections (SSR).

Reference: [https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html](https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html)

## Import

SSRNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ssr } from 'three/addons/tsl/display/SSRNode.js';
```

## Constructor

### new SSRNode( colorNode : Node.<vec4>, depthNode : Node.<float>, normalNode : Node.<vec3>, metalnessNode : Node.<float>, roughnessNode : Node.<float>, camera : Camera )

Constructs a new SSR node.

**colorNode**

The node that represents the beauty pass.

**depthNode**

A node that represents the beauty pass's depth.

**normalNode**

A node that represents the beauty pass's normals.

**metalnessNode**

A node that represents the beauty pass's metalness.

**roughnessNode**

A node that represents the beauty pass's roughness.

Default is `null`.

**camera**

The camera the scene is rendered with.

Default is `null`.

## Properties

### .blurQuality : UniformNode.<int>

The quality of the blur. Must be an integer in the range `[1,3]`.

### .camera : Camera

The camera the scene is rendered with.

### .colorNode : Node.<vec4>

The node that represents the beauty pass.

### .depthNode : Node.<float>

A node that represents the beauty pass's depth.

### .maxDistance : UniformNode.<float>

Controls how far a fragment can reflect. Increasing this value result in more computational overhead but also increases the reflection distance.

### .metalnessNode : Node.<float>

A node that represents the beauty pass's metalness.

### .normalNode : Node.<vec3>

A node that represents the beauty pass's normals.

### .opacity : UniformNode.<float>

Controls how the SSR reflections are blended with the beauty pass.

### .quality : UniformNode.<float>

This parameter controls how detailed the raymarching process works. The value ranges is `[0,1]` where `1` means best quality (the maximum number of raymarching iterations/samples) and `0` means no samples at all.

A quality of `0.5` is usually sufficient for most use cases. Try to keep this parameter as low as possible. Larger values result in noticeable more overhead.

### .resolutionScale : number

The resolution scale. Valid values are in the range `[0,1]`. `1` means best quality but also results in more computational overhead. Setting to `0.5` means the effect is computed in half-resolution.

Default is `1`.

### .thickness : UniformNode.<float>

Controls the cutoff between what counts as a possible reflection hit and what does not.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

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

[examples/jsm/tsl/display/SSRNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SSRNode.js)