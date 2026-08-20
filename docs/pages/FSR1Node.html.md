*Inheritance: EventDispatcher → Node → TempNode →*

# FSR1Node

Post processing node for applying AMD FidelityFX Super Resolution 1 (FSR 1).

Combines two passes:

*   **EASU** (Edge-Adaptive Spatial Upsampling): Uses 12 texture samples in a cross pattern to detect local edge direction, then shapes an approximate Lanczos2 kernel into an ellipse aligned with the detected edge.
*   **RCAS** (Robust Contrast-Adaptive Sharpening): Uses a 5-tap cross pattern to apply contrast-aware sharpening that is automatically limited per-pixel to avoid artifacts.

Note: Only use FSR 1 if your application is fragment-shader bound and cannot afford to render at full resolution. FSR 1 adds its own overhead, so simply shaded scenes will render faster at native resolution without it. Besides, FSR 1 should always be used with an anti-aliased source image.

Reference: [https://gpuopen.com/fidelityfx-superresolution/](https://gpuopen.com/fidelityfx-superresolution/).

## Import

FSR1Node is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { fsr1 } from 'three/addons/tsl/display/fsr1/FSR1Node.js';
```

## Constructor

### new FSR1Node( textureNode : TextureNode, sharpness : Node.<float>, denoise : Node.<bool> )

Constructs a new FSR 1 node.

**textureNode**

The texture node that represents the input of the effect.

**sharpness**

RCAS sharpening strength. 0 = maximum sharpening, 2 = no sharpening.

Default is `0.2`.

**denoise**

Whether to attenuate RCAS sharpening in noisy areas.

Default is `false`.

## Properties

### .denoise : Node.<bool>

Whether to attenuate RCAS sharpening in noisy areas.

### .sharpness : Node.<float>

RCAS sharpening strength. 0 = maximum, 2 = none.

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

[examples/jsm/tsl/display/FSR1Node.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/FSR1Node.js)