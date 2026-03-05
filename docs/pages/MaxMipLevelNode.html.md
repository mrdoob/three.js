*Inheritance: EventDispatcher → Node → InputNode → UniformNode →*

# MaxMipLevelNode

A special type of uniform node that computes the maximum mipmap level for a given texture node.

## Code Example

```js
const level = maxMipLevel( textureNode );
```

## Constructor

### new MaxMipLevelNode( textureNode : TextureNode )

Constructs a new max mip level node.

**textureNode**

The texture node to compute the max mip level for.

## Properties

### .texture : Texture (readonly)

The texture.

### .textureNode : TextureNode (readonly)

The texture node to compute the max mip level for.

### .updateType : string

The `updateType` is set to `NodeUpdateType.FRAME` since the node updates the texture once per frame in its [MaxMipLevelNode#update](MaxMipLevelNode.html#update) method.

Default is `'frame'`.

**Overrides:** [UniformNode#updateType](UniformNode.html#updateType)

## Source

[src/nodes/utils/MaxMipLevelNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/MaxMipLevelNode.js)