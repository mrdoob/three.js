*Inheritance: EventDispatcher → Node → TempNode →*

# TRAANode

A special node that applies TRAA (Temporal Reprojection Anti-Aliasing).

References:

*   [https://alextardif.com/TAA.html](https://alextardif.com/TAA.html)
*   [https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/](https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/)

## Import

TRAANode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { traa } from 'three/addons/tsl/display/TRAANode.js';
```

## Constructor

### new TRAANode( beautyNode : TextureNode, depthNode : TextureNode, velocityNode : TextureNode, camera : Camera )

Constructs a new TRAA node.

**beautyNode**

The texture node that represents the input of the effect.

**depthNode**

A node that represents the scene's depth.

**velocityNode**

A node that represents the scene's velocity.

**camera**

The camera the scene is rendered with.

## Properties

### .beautyNode : TextureNode

The texture node that represents the input of the effect.

### .camera : Camera

The camera the scene is rendered with.

### .depthNode : TextureNode

A node that represents the scene's velocity.

### .depthThreshold : number

When the difference between the current and previous depth goes above this threshold, the history is considered invalid.

Default is `0.0005`.

### .edgeDepthDiff : number

The depth difference within the 3×3 neighborhood to consider a pixel as an edge.

Default is `0.001`.

### .isTRAANode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .maxVelocityLength : number

The history becomes invalid as the pixel length of the velocity approaches this value.

Default is `128`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .useSubpixelCorrection : boolean

Whether to decrease the weight on the current frame when the velocity is more subpixel. This reduces blurriness under motion, but can introduce a square pattern artifact.

Default is `true`.

### .velocityNode : TextureNode

A node that represents the scene's velocity.

## Methods

### .clearViewOffset()

Clears the view offset from the scene's camera.

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

### .setViewOffset( width : number, height : number )

Defines the TRAA's current jitter as a view offset to the scene's camera.

**width**

The width of the effect.

**height**

The height of the effect.

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's render targets and TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to render the effect once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/TRAANode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/TRAANode.js)