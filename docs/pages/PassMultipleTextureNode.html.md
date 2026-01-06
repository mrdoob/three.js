*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode → PassTextureNode →*

# PassMultipleTextureNode

An extension of `PassTextureNode` which allows to manage more than one internal texture. Relevant for the `getPreviousTexture()` related API.

## Constructor

### new PassMultipleTextureNode( passNode : PassNode, textureName : string, previousTexture : boolean )

Constructs a new pass texture node.

**passNode**

The pass node.

**textureName**

The output texture name.

**previousTexture**

Whether previous frame data should be used or not.

Default is `false`.

## Properties

### .previousTexture : boolean

Whether previous frame data should be used or not.

### .textureName : string

The output texture name.

## Methods

### .updateTexture()

Updates the texture reference of this node.

## Source

[src/nodes/display/PassNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/PassNode.js)