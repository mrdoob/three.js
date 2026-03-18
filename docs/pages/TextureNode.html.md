*Inheritance: EventDispatcher → Node → InputNode → UniformNode →*

# TextureNode

This type of uniform node represents a 2D texture.

## Constructor

### new TextureNode( value : Texture, uvNode : Node.<(vec2|vec3)>, levelNode : Node.<int>, biasNode : Node.<float> )

Constructs a new texture node.

**value**

The texture.

Default is `EmptyTexture`.

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

### .biasNode : Node.<float>

Represents the bias to be applied during level-of-detail computation.

Default is `null`.

### .compareNode : Node.<float>

Represents a reference value a texture sample is compared to.

Default is `null`.

### .depthNode : Node.<int>

When using texture arrays, the depth node defines the layer to select.

Default is `null`.

### .gradNode : Array.<Node.<vec2>>

When defined, a texture is sampled using explicit gradients.

Default is `null`.

### .isTextureNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .levelNode : Node.<int>

Represents the mip level that should be selected.

Default is `null`.

### .offsetNode : Node.<(ivec2|ivec3)>

Represents the optional texel offset applied to the unnormalized texture coordinate before sampling the texture.

Default is `null`.

### .referenceNode : Node

The reference node.

Default is `null`.

### .sampler : boolean

Whether texture values should be sampled or fetched.

Default is `true`.

### .updateMatrix : boolean

Whether the uv transformation matrix should be automatically updated or not. Use `setUpdateMatrix()` if you want to change the value of the property.

Default is `false`.

### .updateType : string

By default the `update()` method is not executed. Depending on whether a uv transformation matrix and/or flipY is applied, `update()` is executed per object.

Default is `'none'`.

**Overrides:** [UniformNode#updateType](UniformNode.html#updateType)

### .uvNode : Node.<(vec2|vec3)>

Represents the texture coordinates.

Default is `null`.

### .value : Texture

The texture value.

**Overrides:** [UniformNode#value](UniformNode.html#value)

## Methods

### .bias( biasNode : Node.<float> ) : TextureNode

Samples the texture with the given bias.

**biasNode**

The bias node.

**Returns:** A texture node representing the texture sample.

### .blur( amountNode : Node.<float> ) : TextureNode

Samples a blurred version of the texture by defining an internal bias.

**amountNode**

How blurred the texture should be.

**Returns:** A texture node representing the texture sample.

### .clone() : TextureNode

Clones the texture node.

**Returns:** The cloned texture node.

### .compare( compareNode : Node.<float> ) : TextureNode

Samples the texture by executing a compare operation.

**compareNode**

The node that defines the compare value.

**Returns:** A texture node representing the texture sample.

### .depth( depthNode : Node.<int> ) : TextureNode

Samples the texture by defining a depth node.

**depthNode**

The depth node.

**Returns:** A texture node representing the texture sample.

### .generate( builder : NodeBuilder, output : string ) : string

Generates the code snippet of the texture node.

**builder**

The current node builder.

**output**

The current output.

**Overrides:** [UniformNode#generate](UniformNode.html#generate)

**Returns:** The generated code snippet.

### .generateOffset( builder : NodeBuilder, offsetNode : Node ) : string

Generates the offset code snippet.

**builder**

The current node builder.

**offsetNode**

The offset node to generate code for.

**Returns:** The generated code snippet.

### .generateSnippet( builder : NodeBuilder, textureProperty : string, uvSnippet : string, levelSnippet : string, biasSnippet : string, depthSnippet : string, compareSnippet : string, gradSnippet : Array.<string>, offsetSnippet : string ) : string

Generates the snippet for the texture sampling.

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

**Returns:** The generated code snippet.

### .generateUV( builder : NodeBuilder, uvNode : Node ) : string

Generates the uv code snippet.

**builder**

The current node builder.

**uvNode**

The uv node to generate code for.

**Returns:** The generated code snippet.

### .getBase() : TextureNode

Returns the base texture of this node.

**Returns:** The base texture node.

### .getDefaultUV() : AttributeNode.<vec2>

Returns a default uvs based on the current texture's channel.

**Returns:** The default uvs.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return a fixed value `'texture'`.

**builder**

The current node builder.

**Overrides:** [UniformNode#getInputType](UniformNode.html#getInputType)

**Returns:** The input type.

### .getNodeType( builder : NodeBuilder ) : string

Overwritten since the node type is inferred from the texture type.

**builder**

The current node builder.

**Overrides:** [UniformNode#getNodeType](UniformNode.html#getNodeType)

**Returns:** The node type.

### .getSampler() : boolean

Returns the sampler value.

**Returns:** The sampler value.

### .getTransformedUV( uvNode : Node ) : Node

Transforms the given uv node with the texture transformation matrix.

**uvNode**

The uv node to transform.

**Returns:** The transformed uv node.

### .getUniformHash( builder : NodeBuilder ) : string

Overwritten since the uniform hash is defined by the texture's UUID.

**builder**

The current node builder.

**Overrides:** [UniformNode#getUniformHash](UniformNode.html#getUniformHash)

**Returns:** The uniform hash.

### .grad( gradNodeX : Node.<vec2>, gradNodeY : Node.<vec2> ) : TextureNode

Samples the texture using an explicit gradient.

**gradNodeX**

The gradX node.

**gradNodeY**

The gradY node.

**Returns:** A texture node representing the texture sample.

### .level( levelNode : Node.<int> ) : TextureNode

Samples a specific mip of the texture.

**levelNode**

The mip level to sample.

**Returns:** A texture node representing the texture sample.

### .load( uvNode : Node.<uvec2> ) : TextureNode

TSL function for creating a texture node that fetches/loads texels without interpolation.

**uvNode**

The uv node.

**Returns:** A texture node representing the texture load.

### .offset( offsetNode : Node.<ivec2> ) : TextureNode

Samples the texture by defining an offset node.

**offsetNode**

The offset node.

**Returns:** A texture node representing the texture sample.

### .sample( uvNode : Node ) : TextureNode

Samples the texture with the given uv node.

**uvNode**

The uv node.

**Returns:** A texture node representing the texture sample.

### .setSampler( value : boolean ) : TextureNode

Sets the sampler value.

**value**

The sampler value to set.

**Returns:** A reference to this texture node.

### .setUpdateMatrix( value : boolean ) : TextureNode

Defines whether the uv transformation matrix should automatically be updated or not.

**value**

The update toggle.

**Returns:** A reference to this node.

### .setup( builder : NodeBuilder )

Setups texture node by preparing the internal nodes for code generation.

**builder**

The current node builder.

**Overrides:** [UniformNode#setup](UniformNode.html#setup)

### .setupUV( builder : NodeBuilder, uvNode : Node ) : Node

Setups the uv node. Depending on the backend as well as texture's image and type, it might be necessary to modify the uv node for correct sampling.

**builder**

The current node builder.

**uvNode**

The uv node to setup.

**Returns:** The updated uv node.

### .size( levelNode : Node.<int> ) : TextureSizeNode

Returns the texture size of the requested level.

**levelNode**

The level to compute the size for.

**Returns:** The texture size.

### .update()

The update is used to implement the update of the uv transformation matrix.

**Overrides:** [UniformNode#update](UniformNode.html#update)

### .updateReference( state : any ) : Texture

Overwritten to always return the texture reference of the node.

**state**

This method can be invocated in different contexts so `state` can refer to any object type.

**Overrides:** [UniformNode#updateReference](UniformNode.html#updateReference)

**Returns:** The texture reference.

## Source

[src/nodes/accessors/TextureNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/TextureNode.js)