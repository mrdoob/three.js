*Inheritance: EventDispatcher → Node → TempNode →*

# AnamorphicNode

Post processing node for adding an anamorphic flare effect.

## Import

AnamorphicNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { anamorphic } from 'three/addons/tsl/display/AnamorphicNode.js';
```

## Constructor

### new AnamorphicNode( textureNode : TextureNode, thresholdNode : Node.<float>, scaleNode : Node.<float>, samples : number )

Constructs a new anamorphic node.

**textureNode**

The texture node that represents the input of the effect.

**thresholdNode**

The threshold is one option to control the intensity and size of the effect.

**scaleNode**

Defines the vertical scale of the flares.

**samples**

More samples result in larger flares and a more expensive runtime behavior.

## Properties

### .colorNode : Node.<vec3>

The color of the flares.

### .resolution : Vector2

The resolution scale.

Default is `{(1,1)}`.

**Deprecated:** Yes

### .resolutionScale : number

The resolution scale.

### .samples : Node.<float>

More samples result in larger flares and a more expensive runtime behavior.

### .scaleNode : Node.<float>

Defines the vertical scale of the flares.

### .textureNode : TextureNode

The texture node that represents the input of the effect.

### .thresholdNode : Node.<float>

The threshold is one option to control the intensity and size of the effect.

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

[examples/jsm/tsl/display/AnamorphicNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/AnamorphicNode.js)