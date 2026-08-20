*Inheritance: EventDispatcher → Node → TempNode →*

# SharpenNode

Post processing node for contrast-adaptive sharpening (RCAS).

Reference: [https://gpuopen.com/fidelityfx-superresolution/](https://gpuopen.com/fidelityfx-superresolution/).

## Import

SharpenNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { sharpen } from 'three/addons/tsl/display/SharpenNode.js';
```

## Constructor

### new SharpenNode( textureNode : TextureNode, sharpness : Node.<float>, denoise : Node.<bool> )

Constructs a new sharpen node.

**textureNode**

The texture node that represents the input of the effect.

**sharpness**

Sharpening strength. 0 = maximum sharpening, 2 = no sharpening.

Default is `0.2`.

**denoise**

Whether to attenuate sharpening in noisy areas.

Default is `false`.

## Properties

### .denoise : Node.<bool>

Whether to attenuate sharpening in noisy areas.

Default is `false`.

### .isSharpenNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .sharpness : Node.<float>

Sharpening strength. 0 = maximum, 2 = none.

Default is `0.2`.

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

Sets the output size of the effect.

**width**

The width in pixels.

**height**

The height in pixels.

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

[examples/jsm/tsl/display/SharpenNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SharpenNode.js)