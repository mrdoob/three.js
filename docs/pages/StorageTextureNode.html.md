*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode →*

# StorageTextureNode

This special version of a texture node can be used to write data into a storage texture with a compute shader.

This node can only be used with a WebGPU backend.

## Code Example

```js
const storageTexture = new THREE.StorageTexture( width, height );
const computeTexture = Fn( ( { storageTexture } ) => {
	const posX = instanceIndex.mod( width );
	const posY = instanceIndex.div( width );
	const indexUV = uvec2( posX, posY );
	// generate RGB values
	const r = 1;
	const g = 1;
	const b = 1;
	textureStore( storageTexture, indexUV, vec4( r, g, b, 1 ) ).toWriteOnly();
} );
const computeNode = computeTexture( { storageTexture } ).compute( width * height );
renderer.computeAsync( computeNode );
```

## Constructor

### new StorageTextureNode( value : StorageTexture, uvNode : Node.<(vec2|vec3)>, storeNode : Node )

Constructs a new storage texture node.

**value**

The storage texture.

**uvNode**

The uv node.

**storeNode**

The value node that should be stored in the texture.

Default is `null`.

## Properties

### .access : string

The access type of the texture node.

Default is `'writeOnly'`.

### .isStorageTextureNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .mipLevel : number

The mip level to write to for storage textures.

Default is `0`.

### .storeNode : Node

The value node that should be stored in the texture.

Default is `null`.

## Methods

### .generate( builder : NodeBuilder, output : string ) : string

Generates the code snippet of the storage node. If no `storeNode` is defined, the texture node is generated as normal texture.

**builder**

The current node builder.

**output**

The current output.

**Overrides:** [TextureNode#generate](TextureNode.html#generate)

**Returns:** The generated code snippet.

### .generateSnippet( builder : NodeBuilder, textureProperty : string, uvSnippet : string, levelSnippet : string, biasSnippet : string, depthSnippet : string, compareSnippet : string, gradSnippet : Array.<string>, offsetSnippet : string ) : string

Generates the snippet for the storage texture.

**builder**

The current node builder.

**textureProperty**

The texture property.

**uvSnippet**

The uv snippet.

**levelSnippet**

The level snippet.

**biasSnippet**

The bias snippet.

**depthSnippet**

The depth snippet.

**compareSnippet**

The compare snippet.

**gradSnippet**

The grad snippet.

**offsetSnippet**

The offset snippet.

**Overrides:** [TextureNode#generateSnippet](TextureNode.html#generateSnippet)

**Returns:** The generated code snippet.

### .generateStore( builder : NodeBuilder )

Generates the code snippet of the storage texture node.

**builder**

The current node builder.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return a fixed value `'storageTexture'`.

**builder**

The current node builder.

**Overrides:** [TextureNode#getInputType](TextureNode.html#getInputType)

**Returns:** The input type.

### .setAccess( value : string ) : StorageTextureNode

Defines the node access.

**value**

The node access.

**Returns:** A reference to this node.

### .setMipLevel( level : number ) : StorageTextureNode

Sets the mip level to write to.

**level**

The mip level.

**Returns:** A reference to this node.

### .toReadOnly() : StorageTextureNode

Convenience method for configuring a read-only node access.

**Returns:** A reference to this node.

### .toReadWrite() : StorageTextureNode

Convenience method for configuring a read/write node access.

**Returns:** A reference to this node.

### .toWriteOnly() : StorageTextureNode

Convenience method for configuring a write-only node access.

**Returns:** A reference to this node.

## Source

[src/nodes/accessors/StorageTextureNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/StorageTextureNode.js)