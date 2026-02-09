*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode →*

# Texture3DNode

This type of uniform node represents a 3D texture.

## Constructor

### new Texture3DNode( value : Data3DTexture, uvNode : Node.<(vec2|vec3)>, levelNode : Node.<int> )

Constructs a new 3D texture node.

**value**

The 3D texture.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

## Properties

### .isTexture3DNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .generateOffset( builder : NodeBuilder, offsetNode : Node ) : string

Generates the offset code snippet.

**builder**

The current node builder.

**offsetNode**

The offset node to generate code for.

**Overrides:** [TextureNode#generateOffset](TextureNode.html#generateOffset)

**Returns:** The generated code snippet.

### .generateUV( builder : NodeBuilder, uvNode : Node ) : string

Generates the uv code snippet.

**builder**

The current node builder.

**uvNode**

The uv node to generate code for.

**Overrides:** [TextureNode#generateUV](TextureNode.html#generateUV)

**Returns:** The generated code snippet.

### .getDefaultUV() : Node.<vec3>

Returns a default uv node which is in context of 3D textures a three-dimensional uv node.

**Overrides:** [TextureNode#getDefaultUV](TextureNode.html#getDefaultUV)

**Returns:** The default uv node.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return a fixed value `'texture3D'`.

**builder**

The current node builder.

**Overrides:** [TextureNode#getInputType](TextureNode.html#getInputType)

**Returns:** The input type.

### .normal( uvNode : Node.<vec3> ) : Node.<vec3>

Computes the normal for the given uv. These texture coordiantes represent a position inside the 3D texture. Unlike geometric normals, this normal represents a slope or gradient of scalar data inside the 3D texture.

**uvNode**

The uv node that defines a position in the 3D texture.

**Returns:** The normal representing the slope/gradient in the data.

### .setUpdateMatrix( value : boolean )

Overwritten with an empty implementation since the `updateMatrix` flag is ignored for 3D textures. The uv transformation matrix is not applied to 3D textures.

**value**

The update toggle.

**Overrides:** [TextureNode#setUpdateMatrix](TextureNode.html#setUpdateMatrix)

## Source

[src/nodes/accessors/Texture3DNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/Texture3DNode.js)