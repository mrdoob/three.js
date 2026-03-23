*Inheritance: EventDispatcher → Node → TempNode →*

# BilateralBlurNode

Post processing node for creating a bilateral blur effect.

Bilateral blur smooths an image while preserving sharp edges. Unlike a standard Gaussian blur which blurs everything equally, bilateral blur analyzes the intensity/color of neighboring pixels. If a neighbor is too different from the center pixel (indicating an edge), it is excluded from the blurring process.

Reference: [https://en.wikipedia.org/wiki/Bilateral\_filter](https://en.wikipedia.org/wiki/Bilateral_filter)

## Import

BilateralBlurNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { bilateralBlur } from 'three/addons/tsl/display/BilateralBlurNode.js';
```

## Constructor

### new BilateralBlurNode( textureNode : TextureNode, directionNode : Node.<(vec2|float)>, sigma : number, sigmaColor : number )

Constructs a new bilateral blur node.

**textureNode**

The texture node that represents the input of the effect.

**directionNode**

Defines the direction and radius of the blur.

Default is `null`.

**sigma**

Controls the spatial kernel of the blur filter. Higher values mean a wider blur radius.

Default is `4`.

**sigmaColor**

Controls the intensity kernel. Higher values allow more color difference to be blurred together.

Default is `0.1`.

## Properties

### .directionNode : Node.<(vec2|float)>

Defines the direction and radius of the blur.

### .resolutionScale : number

The resolution scale.

Default is `1`.

### .sigma : number

Controls the spatial kernel of the blur filter. Higher values mean a wider blur radius.

### .sigmaColor : number

Controls the color/intensity kernel. Higher values allow more color difference to be blurred together. Lower values preserve edges more strictly.

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

[examples/jsm/tsl/display/BilateralBlurNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/BilateralBlurNode.js)