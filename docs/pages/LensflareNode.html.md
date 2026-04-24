*Inheritance: EventDispatcher → Node → TempNode →*

# LensflareNode

Post processing node for adding a bloom-based lens flare effect. This effect requires that you extract the bloom of the scene via a bloom pass first.

References:

*   [https://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html](https://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html).
*   [https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html](https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html).

## Import

LensflareNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { lensflare } from 'three/addons/tsl/display/LensflareNode.js';
```

## Constructor

### new LensflareNode( textureNode : TextureNode, params : Object )

Constructs a new lens flare node.

**textureNode**

The texture node that represents the scene's bloom.

**params**

The parameter object for configuring the effect.

**ghostTint**

Defines the tint of the flare/ghosts.

Default is `vec3(1, 1, 1)`.

**threshold**

Controls the size and strength of the effect. A higher threshold results in smaller flares.

Default is `float(0.5)`.

**ghostSamples**

Represents the number of flares/ghosts per bright spot which pivot around the center.

Default is `float(4)`.

**ghostSpacing**

Defines the spacing of the flares/ghosts.

Default is `float(0.25)`.

**ghostAttenuationFactor**

Defines the attenuation factor of flares/ghosts.

Default is `float(25)`.

**downSampleRatio**

Defines how downsampling since the effect is usually not rendered at full resolution.

Default is `4`.

## Properties

### .downSampleRatio : number

Defines how downsampling since the effect is usually not rendered at full resolution.

### .ghostAttenuationFactorNode : Node.<float>

Defines the attenuation factor of flares/ghosts.

### .ghostSamplesNode : Node.<float>

Represents the number of flares/ghosts per bright spot which pivot around the center.

### .ghostSpacingNode : Node.<float>

Defines the spacing of the flares/ghosts.

### .ghostTintNode : Node.<vec3>

Defines the tint of the flare/ghosts.

### .textureNode : TextureNode

The texture node that represents the scene's bloom.

### .thresholdNode : Node.<float>

Controls the size and strength of the effect. A higher threshold results in smaller flares.

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

[examples/jsm/tsl/display/LensflareNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/LensflareNode.js)