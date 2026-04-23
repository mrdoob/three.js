*Inheritance: EventDispatcher → Node → TempNode →*

# SMAANode

Post processing node for applying SMAA. Unlike FXAA, this node should be applied before converting colors to sRGB. SMAA should produce better results than FXAA but is also more expensive to execute.

Used Preset: SMAA 1x Medium (with color edge detection) Reference: [https://github.com/iryoku/smaa/releases/tag/v2.8](https://github.com/iryoku/smaa/releases/tag/v2.8).

## Import

SMAANode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { smaa } from 'three/addons/tsl/display/SMAANode.js';
```

## Constructor

### new SMAANode( textureNode : TextureNode )

Constructs a new SMAA node.

**textureNode**

The texture node that represents the input of the effect.

## Properties

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

[examples/jsm/tsl/display/SMAANode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SMAANode.js)