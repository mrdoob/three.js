*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode →*

# ViewportTextureNode

A special type of texture node which represents the data of the current viewport as a texture. The module extracts data from the current bound framebuffer with a copy operation so no extra render pass is required to produce the texture data (which is good for performance). `ViewportTextureNode` can be used as an input for a variety of effects like refractive or transmissive materials.

## Constructor

### new ViewportTextureNode( uvNode : Node, levelNode : Node, framebufferTexture : Texture )

Constructs a new viewport texture node.

**uvNode**

The uv node.

Default is `screenUV`.

**levelNode**

The level node.

Default is `null`.

**framebufferTexture**

A framebuffer texture holding the viewport data. If not provided, a framebuffer texture is created automatically.

Default is `null`.

## Properties

### .defaultFramebuffer : FramebufferTexture

The reference framebuffer texture. This is used to store the framebuffer texture for the current render target. If the render target changes, a new framebuffer texture is created automatically.

Default is `null`.

### .generateMipmaps : boolean

Whether to generate mipmaps or not.

Default is `false`.

### .isOutputTextureNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders the scene once per frame in its [ViewportTextureNode#updateBefore](ViewportTextureNode.html#updateBefore) method.

Default is `'frame'`.

**Overrides:** [TextureNode#updateBeforeType](TextureNode.html#updateBeforeType)

## Methods

### .getTextureForReference( reference : RenderTarget ) : Texture

This methods returns a texture for the given render target reference.

To avoid rendering errors, `ViewportTextureNode` must use unique framebuffer textures for different render contexts.

**reference**

The render target reference.

Default is `null`.

**Returns:** The framebuffer texture.

## Source

[src/nodes/display/ViewportTextureNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/ViewportTextureNode.js)