*Inheritance: EventDispatcher → Node → TempNode →*

# AfterImageNode

Post processing node for creating an after image effect.

## Import

AfterImageNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { afterImage } from 'three/addons/tsl/display/AfterImageNode.js';
```

## Constructor

### new AfterImageNode( textureNode : TextureNode, damp : Node.<float> )

Constructs a new after image node.

**textureNode**

The texture node that represents the input of the effect.

**damp**

The damping intensity. A higher value means a stronger after image effect.

Default is `0.96`.

## Properties

### .damp : Node.<float>

How quickly the after-image fades. A higher value means the after-image persists longer, while a lower value means it fades faster. Should be in the range `[0, 1]`.

### .textureNode : TextureNode

The texture node that represents the input of the effect.

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

[examples/jsm/tsl/display/AfterImageNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/AfterImageNode.js)