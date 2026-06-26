*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode → StorageTextureNode →*

# StorageTexture3DNode

This special version of a texture node can be used to write data into a 3D storage texture with a compute shader.

## Constructor

### new StorageTexture3DNode( value : Storage3DTexture, uvNode : Node.<vec3>, storeNode : Node )

Constructs a new 3D storage texture node.

**value**

The 3D storage texture.

**uvNode**

The uv node.

**storeNode**

The value node that should be stored in the texture.

Default is `null`.

## Properties

### .isStorageTexture3DNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .generateOffset( builder : NodeBuilder, offsetNode : Node ) : string

Generates the offset code snippet.

**builder**

The current node builder.

**offsetNode**

The offset node to generate code for.

**Overrides:** [StorageTextureNode#generateOffset](StorageTextureNode.html#generateOffset)

**Returns:** The generated code snippet.

### .generateUV( builder : NodeBuilder, uvNode : Node ) : string

Generates the uv code snippet.

**builder**

The current node builder.

**uvNode**

The uv node to generate code for.

**Overrides:** [StorageTextureNode#generateUV](StorageTextureNode.html#generateUV)

**Returns:** The generated code snippet.

### .getDefaultUV() : Node.<vec3>

Returns a default uv node which is in context of 3D textures a three-dimensional uv node.

**Overrides:** [StorageTextureNode#getDefaultUV](StorageTextureNode.html#getDefaultUV)

**Returns:** The default uv node.

### .setUpdateMatrix( value : boolean )

Overwritten with an empty implementation since the `updateMatrix` flag is ignored for 3D textures. The uv transformation matrix is not applied to 3D textures.

**value**

The update toggle.

**Overrides:** [StorageTextureNode#setUpdateMatrix](StorageTextureNode.html#setUpdateMatrix)

## Source

[src/nodes/accessors/StorageTexture3DNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/StorageTexture3DNode.js)