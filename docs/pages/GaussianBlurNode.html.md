*Inheritance: EventDispatcher → Node → TempNode →*

# GaussianBlurNode

Post processing node for creating a gaussian blur effect.

## Import

GaussianBlurNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { gaussianBlur, premultipliedGaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js';
```

## Constructor

### new GaussianBlurNode( textureNode : TextureNode, directionNode : Node.<(vec2|float)>, sigma : number, options : Object )

Constructs a new gaussian blur node.

**textureNode**

The texture node that represents the input of the effect.

**directionNode**

Defines the direction and radius of the blur.

Default is `null`.

**sigma**

Controls the kernel of the blur filter. Higher values mean a wider blur radius.

Default is `4`.

**options**

Additional options for the gaussian blur effect.

Default is `{}`.

**premultipliedAlpha**

Whether to use premultiplied alpha for the blur effect.

Default is `false`.

**resolutionScale**

The resolution of the effect. 0.5 means half the resolution of the texture node.

Default is `1`.

## Properties

### .directionNode : Node.<(vec2|float)>

Defines the direction and radius of the blur.

### .isGaussianBlurNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .premultipliedAlpha : boolean

Whether the effect should use premultiplied alpha or not. Set this to `true` if you are going to blur texture input with transparency.

Default is `false`.

### .resolution : Vector2

The resolution scale.

Default is `{(1,1)}`.

**Deprecated:** Yes

### .resolutionScale : number

The resolution scale.

Default is `(1)`.

### .sigma : number

Controls the kernel of the blur filter. Higher values mean a wider blur radius.

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

[examples/jsm/tsl/display/GaussianBlurNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/GaussianBlurNode.js)