*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode → ViewportTextureNode →*

# ViewportDepthTextureNode

Represents the depth of the current viewport as a texture. This module can be used in combination with viewport texture to achieve effects that require depth evaluation.

## Constructor

### new ViewportDepthTextureNode( uvNode : Node, levelNode : Node )

Constructs a new viewport depth texture node.

**uvNode**

The uv node.

Default is `screenUV`.

**levelNode**

The level node.

Default is `null`.

## Methods

### .getTextureForReference() : DepthTexture

Overwritten so the method always returns the unique shared depth texture.

**Overrides:** [ViewportTextureNode#getTextureForReference](ViewportTextureNode.html#getTextureForReference)

**Returns:** The shared depth texture.

## Source

[src/nodes/display/ViewportDepthTextureNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/ViewportDepthTextureNode.js)