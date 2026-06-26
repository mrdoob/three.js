*Inheritance: EventDispatcher → Node → TempNode →*

# DepthOfFieldNode

Post processing node for creating depth of field (DOF) effect.

References:

*   [https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/](https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/)
*   [https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/](https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/)

## Import

DepthOfFieldNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { dof } from 'three/addons/tsl/display/DepthOfFieldNode.js';
```

## Constructor

### new DepthOfFieldNode( textureNode : TextureNode, viewZNode : Node.<float>, focusDistanceNode : Node.<float>, focalLengthNode : Node.<float>, bokehScaleNode : Node.<float> )

Constructs a new DOF node.

**textureNode**

The texture node that represents the input of the effect.

**viewZNode**

Represents the viewZ depth values of the scene.

**focusDistanceNode**

Defines the effect's focus which is the distance along the camera's look direction in world units.

**focalLengthNode**

How far an object can be from the focal plane before it goes completely out-of-focus in world units.

**bokehScaleNode**

A unitless value for artistic purposes to adjust the size of the bokeh.

## Properties

### .bokehScaleNode : Node.<float>

A unitless value for artistic purposes to adjust the size of the bokeh.

### .focalLengthNode : Node.<float>

How far an object can be from the focal plane before it goes completely out-of-focus in world units.

### .focusDistanceNode : Node.<float>

Defines the effect's focus which is the distance along the camera's look direction in world units.

### .textureNode : TextureNode

The texture node that represents the input of the effect.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates its internal uniforms once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .viewZNode : Node.<float>

Represents the viewZ depth values of the scene.

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

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to update the effect's uniforms once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/DepthOfFieldNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/DepthOfFieldNode.js)