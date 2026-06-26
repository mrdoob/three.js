*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode →*

# RTTNode

`RTTNode` takes another node and uses it with a `QuadMesh` to render into a texture (RTT). This module is especially relevant in context of post processing where certain nodes require texture input for their effects. With the helper function `convertToTexture()` which is based on this module, the node system can automatically ensure texture input if required.

## Constructor

### new RTTNode( node : Node, width : number, height : number, options : Object )

Constructs a new RTT node.

**node**

The node to render a texture with.

**width**

The width of the internal render target. If not width is applied, the render target is automatically resized.

Default is `null`.

**height**

The height of the internal render target.

Default is `null`.

**options**

The options for the internal render target.

Default is `{type:HalfFloatType}`.

## Properties

### .autoResize : boolean (readonly)

Whether the internal render target should automatically be resized or not.

Default is `true`.

### .autoUpdate : boolean

Whether the texture should automatically be updated or not.

Default is `true`.

### .height : number

The height of the internal render target.

Default is `null`.

### .isRTTNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .node : Node

The node to render a texture with.

### .renderTarget : RenderTarget

The render target

### .textureNeedsUpdate : boolean

Whether the texture requires an update or not.

Default is `true`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.RENDER` since the node updates the texture once per render in its [RTTNode#updateBefore](RTTNode.html#updateBefore) method.

Default is `'render'`.

**Overrides:** [TextureNode#updateBeforeType](TextureNode.html#updateBeforeType)

### .width : number

The width of the internal render target. If not width is applied, the render target is automatically resized.

Default is `null`.

## Methods

### .getResolutionScale() : number

Gets the resolution scale.

**Returns:** The resolution scale.

### .setResolutionScale( resolutionScale : number ) : RTTNode

Sets the resolution scale. The resolution scale is a factor that is multiplied with the renderer's width and height.

**resolutionScale**

The resolution scale to set. A value of `1` means full resolution.

**Returns:** A reference to this node.

### .setSize( width : number, height : number )

Sets the size of the internal render target

**width**

The width to set.

**height**

The width to set.

## Source

[src/nodes/utils/RTTNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/RTTNode.js)