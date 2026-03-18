*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode →*

# CubeTextureNode

This type of uniform node represents a cube texture.

## Constructor

### new CubeTextureNode( value : CubeTexture, uvNode : Node.<vec3>, levelNode : Node.<int>, biasNode : Node.<float> )

Constructs a new cube texture node.

**value**

The cube texture.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

## Properties

### .isCubeTextureNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .generateUV( builder : NodeBuilder, cubeUV : Node ) : string

Generates the uv code snippet.

**builder**

The current node builder.

**cubeUV**

The uv node to generate code for.

**Overrides:** [TextureNode#generateUV](TextureNode.html#generateUV)

**Returns:** The generated code snippet.

### .getDefaultUV() : Node.<vec3>

Returns a default uvs based on the mapping type of the cube texture.

**Overrides:** [TextureNode#getDefaultUV](TextureNode.html#getDefaultUV)

**Returns:** The default uv attribute.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return the appropriate cube texture type.

**builder**

The current node builder.

**Overrides:** [TextureNode#getInputType](TextureNode.html#getInputType)

**Returns:** The input type.

### .setUpdateMatrix( value : boolean )

Overwritten with an empty implementation since the `updateMatrix` flag is ignored for cube textures. The uv transformation matrix is not applied to cube textures.

**value**

The update toggle.

**Overrides:** [TextureNode#setUpdateMatrix](TextureNode.html#setUpdateMatrix)

### .setupUV( builder : NodeBuilder, uvNode : Node ) : Node

Setups the uv node. Depending on the backend as well as the texture type, it might be necessary to modify the uv node for correct sampling.

**builder**

The current node builder.

**uvNode**

The uv node to setup.

**Overrides:** [TextureNode#setupUV](TextureNode.html#setupUV)

**Returns:** The updated uv node.

## Source

[src/nodes/accessors/CubeTextureNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/CubeTextureNode.js)