*Inheritance: NodeBuilder →*

# WGSLNodeBuilder

A node builder targeting WGSL.

This module generates WGSL shader code from node materials and also generates the respective bindings and vertex buffer definitions. These data are later used by the renderer to create render and compute pipelines for render objects.

## Constructor

### new WGSLNodeBuilder( object : Object3D, renderer : Renderer )

Constructs a new WGSL node builder renderer.

**object**

The 3D object.

**renderer**

The renderer.

## Properties

### .builtins : Object.<string, Map.<string, Object>>

A dictionary that holds for each shader stage a Map of builtins.

### .directives : Object.<string, Set.<string>>

A dictionary that holds for each shader stage a Set of directives.

### .scopedArrays : Map.<string, Object>

A map for managing scope arrays. Only relevant for when using [WorkgroupInfoNode](WorkgroupInfoNode.html) in context of compute shaders.

### .uniformGroups : Object.<string, Object.<string, NodeUniformsGroup>>

A dictionary that holds for each shader stage ('vertex', 'fragment', 'compute') another dictionary which manages UBOs per group ('render','frame','object').

### .uniformGroupsBindings : Object.<string, {index: number, id: number}>

A dictionary that holds the assigned binding indices for each uniform group. This ensures the same binding index is used across all shader stages.

## Methods

### .buildCode()

Controls the code build of the shader stages.

**Overrides:** [NodeBuilder#buildCode](NodeBuilder.html#buildCode)

### .buildFunctionCode( shaderNode : ShaderNodeInternal ) : string

Builds the given shader node.

**shaderNode**

The shader node.

**Overrides:** [NodeBuilder#buildFunctionCode](NodeBuilder.html#buildFunctionCode)

**Returns:** The WGSL function code.

### .enableClipDistances()

Enables the 'clip\_distances' directive.

### .enableDirective( name : string, shaderStage : string )

Enables the given directive for the given shader stage.

**name**

The directive name.

**shaderStage**

The shader stage to enable the directive for.

Default is `this.shaderStage`.

### .enableDualSourceBlending()

Enables the 'dual\_source\_blending' directive.

### .enableHardwareClipping( planeCount : string )

Enables hardware clipping.

**planeCount**

The clipping plane count.

### .enableShaderF16()

Enables the 'f16' directive.

### .enableSubGroups()

Enables the 'subgroups' directive.

### .enableSubgroupsF16()

Enables the 'subgroups-f16' directive.

### .generateArrayDeclaration( type : string, count : number ) : string

Generates the array declaration string.

**type**

The type.

**count**

The count.

**Overrides:** [NodeBuilder#generateArrayDeclaration](NodeBuilder.html#generateArrayDeclaration)

**Returns:** The generated value as a shader string.

### .generateFilteredTexture( texture : Texture, textureProperty : string, uvSnippet : string, offsetSnippet : string, levelSnippet : string ) : string

Generates the WGSL snippet for a manual filtered texture.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**levelSnippet**

A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

Default is `'0u'`.

**Returns:** The WGSL snippet.

### .generateTexture( texture : Texture, textureProperty : string, uvSnippet : string, depthSnippet : string, offsetSnippet : string, shaderStage : string ) : string

Generates the WGSL snippet for sampling/loading the given texture.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Overrides:** [NodeBuilder#generateTexture](NodeBuilder.html#generateTexture)

**Returns:** The WGSL snippet.

### .generateTextureBias( texture : Texture, textureProperty : string, uvSnippet : string, biasSnippet : string, depthSnippet : string, offsetSnippet : string, shaderStage : string ) : string

Generates the WGSL snippet when sampling textures with a bias to the mip level.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**biasSnippet**

A WGSL snippet that represents the bias to apply to the mip level before sampling.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** The WGSL snippet.

### .generateTextureCompare( texture : Texture, textureProperty : string, uvSnippet : string, compareSnippet : string, depthSnippet : string, offsetSnippet : string, shaderStage : string ) : string

Generates the WGSL snippet for sampling a depth texture and comparing the sampled depth values against a reference value.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**compareSnippet**

A WGSL snippet that represents the reference value.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** The WGSL snippet.

### .generateTextureDimension( texture : Texture, textureProperty : string, levelSnippet : string ) : string

Generates a WGSL variable that holds the texture dimension of the given texture. It also returns information about the number of layers (elements) of an arrayed texture as well as the cube face count of cube textures.

**texture**

The texture to generate the function for.

**textureProperty**

The name of the video texture uniform in the shader.

**levelSnippet**

A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

**Returns:** The name of the dimension variable.

### .generateTextureGrad( texture : Texture, textureProperty : string, uvSnippet : string, gradSnippet : Array.<string>, depthSnippet : string, offsetSnippet : string, shaderStage : string ) : string

Generates the WGSL snippet for sampling/loading the given texture using explicit gradients.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**gradSnippet**

An array holding both gradient WGSL snippets.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** The WGSL snippet.

### .generateTextureLevel( texture : Texture, textureProperty : string, uvSnippet : string, levelSnippet : string, depthSnippet : string, offsetSnippet : string, shaderStage : string ) : string

Generates the WGSL snippet when sampling textures with explicit mip level.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**levelSnippet**

A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** The WGSL snippet.

### .generateTextureLoad( texture : Texture, textureProperty : string, uvIndexSnippet : string, levelSnippet : string, depthSnippet : string, offsetSnippet : string ) : string

Generates the WGSL snippet that reads a single texel from a texture without sampling or filtering.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvIndexSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**levelSnippet**

A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**Returns:** The WGSL snippet.

### .generateTextureLod( texture : Texture, textureProperty : string, uvSnippet : string, depthSnippet : string, offsetSnippet : string, levelSnippet : string ) : string

Generates the WGSL snippet for a texture lookup with explicit level-of-detail. Since it's a lookup, no sampling or filtering is applied.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**levelSnippet**

A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

Default is `'0u'`.

**Overrides:** [NodeBuilder#generateTextureLod](NodeBuilder.html#generateTextureLod)

**Returns:** The WGSL snippet.

### .generateTextureStore( texture : Texture, textureProperty : string, uvIndexSnippet : string, depthSnippet : string, valueSnippet : string ) : string

Generates the WGSL snippet that writes a single texel to a texture.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvIndexSnippet**

A WGSL snippet that represents texture coordinates used for sampling.

**depthSnippet**

A WGSL snippet that represents 0-based texture array index to sample.

**valueSnippet**

A WGSL snippet that represent the new texel value.

**Returns:** The WGSL snippet.

### .generateWrapFunction( texture : Texture ) : string

Generates a wrap function used in context of textures.

**texture**

The texture to generate the function for.

**Returns:** The name of the generated function.

### .getAttributes( shaderStage : string ) : string

Returns the shader attributes of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getAttributes](NodeBuilder.html#getAttributes)

**Returns:** The WGSL snippet that defines the shader attributes.

### .getBitcastMethod( type : string ) : string

Returns the bitcast method name for a given input and outputType.

**type**

The output type to bitcast to.

**Returns:** The resolved WGSL bitcast invocation.

### .getBuiltin( name : string, property : string, type : string, shaderStage : string ) : string

This method should be used whenever builtins are required in nodes. The internal builtins data structure will make sure builtins are defined in the WGSL source.

**name**

The builtin name.

**property**

The property name.

**type**

The node data type.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** The property name.

### .getBuiltins( shaderStage : string ) : string

Returns the builtins of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Returns:** A WGSL snippet that represents the builtins of the given stage.

### .getClipDistance() : string

Returns the clip distances builtin.

**Returns:** The clip distances builtin.

### .getDirectives( shaderStage : string ) : string

Returns the directives of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Returns:** A WGSL snippet that enables the directives of the given stage.

### .getDrawIndex() : null

Overwritten as a NOP since this method is intended for the WebGL 2 backend.

**Overrides:** [NodeBuilder#getDrawIndex](NodeBuilder.html#getDrawIndex)

**Returns:** Null.

### .getFloatPackingMethod( encoding : string ) : string

Returns the float packing method name for a given numeric encoding.

**encoding**

The numeric encoding that describes how the float values are mapped to the integer range.

**Returns:** The resolve WGSL float packing method name.

### .getFloatUnpackingMethod( encoding : string ) : string

Returns the float unpacking method name for a given numeric encoding.

**encoding**

The numeric encoding that describes how the integer values are mapped to the float range.

**Returns:** The resolve WGSL float unpacking method name.

### .getFragCoord() : string

Returns the frag coord builtin.

**Overrides:** [NodeBuilder#getFragCoord](NodeBuilder.html#getFragCoord)

**Returns:** The frag coord builtin.

### .getFragDepth() : string

Returns the frag depth builtin.

**Returns:** The frag depth builtin.

### .getFrontFacing() : string

Returns the front facing builtin.

**Overrides:** [NodeBuilder#getFrontFacing](NodeBuilder.html#getFrontFacing)

**Returns:** The front facing builtin.

### .getFunctionOperator( op : string ) : string

Returns the native shader operator name for a given generic name.

**op**

The operator name to resolve.

**Overrides:** [NodeBuilder#getFunctionOperator](NodeBuilder.html#getFunctionOperator)

**Returns:** The resolved operator name.

### .getInstanceIndex() : string

Contextually returns either the vertex stage instance index builtin or the linearized index of an compute invocation within a grid of workgroups.

**Overrides:** [NodeBuilder#getInstanceIndex](NodeBuilder.html#getInstanceIndex)

**Returns:** The instance index.

### .getInvocationLocalIndex() : string

Returns a builtin representing the index of a compute invocation within the scope of a workgroup load.

**Returns:** The invocation local index.

### .getInvocationSubgroupIndex() : string

Returns a builtin representing the index of a compute invocation within the scope of a subgroup.

**Returns:** The invocation subgroup index.

### .getMethod( method : string, output : string ) : string

Returns the native shader method name for a given generic name.

**method**

The method name to resolve.

**output**

An optional output.

Default is `null`.

**Overrides:** [NodeBuilder#getMethod](NodeBuilder.html#getMethod)

**Returns:** The resolved WGSL method name.

### .getNodeAccess( node : StorageTextureNode | StorageBufferNode, shaderStage : string ) : string

Returns the node access for the given node and shader stage.

**node**

The storage node.

**shaderStage**

The shader stage.

**Returns:** The node access.

### .getOutputStructName() : string

Returns the output struct name.

**Overrides:** [NodeBuilder#getOutputStructName](NodeBuilder.html#getOutputStructName)

**Returns:** The name of the output struct.

### .getPropertyName( node : Node, shaderStage : string ) : string

Returns a WGSL snippet that represents the property name of the given node.

**node**

The node.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Overrides:** [NodeBuilder#getPropertyName](NodeBuilder.html#getPropertyName)

**Returns:** The property name.

### .getScopedArray( name : string, scope : string, bufferType : string, bufferCount : string ) : string

This method should be used when a new scoped buffer is used in context of compute shaders. It adds the array to the internal data structure which is later used to generate the respective WGSL.

**name**

The array name.

**scope**

The scope.

**bufferType**

The buffer type.

**bufferCount**

The buffer count.

**Returns:** The array name.

### .getScopedArrays( shaderStage : string ) : string | undefined

Returns the scoped arrays of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Returns:** The WGSL snippet that defines the scoped arrays. Returns `undefined` when used in the vertex or fragment stage.

### .getStorageAccess( node : StorageTextureNode | StorageBufferNode, shaderStage : string ) : string

Returns A WGSL snippet representing the storage access.

**node**

The storage node.

**shaderStage**

The shader stage.

**Returns:** The WGSL snippet representing the storage access.

### .getStructMembers( struct : StructTypeNode ) : string

Returns the members of the given struct type node as a WGSL string.

**struct**

The struct type node.

**Returns:** The WGSL snippet that defines the struct members.

### .getStructs( shaderStage : string ) : string

Returns the structs of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Returns:** The WGSL snippet that defines the structs.

### .getSubgroupIndex() : string

Returns a builtin representing the index of a compute invocation's subgroup within its workgroup.

**Returns:** The subgroup index.

### .getSubgroupSize() : string

Returns a builtin representing the size of a subgroup within the current shader.

**Returns:** The subgroup size.

### .getTernary( condSnippet : string, ifSnippet : string, elseSnippet : string ) : string

Returns the native snippet for a ternary operation.

**condSnippet**

The condition determining which expression gets resolved.

**ifSnippet**

The expression to resolve to if the condition is true.

**elseSnippet**

The expression to resolve to if the condition is false.

**Overrides:** [NodeBuilder#getTernary](NodeBuilder.html#getTernary)

**Returns:** The resolved method name.

### .getType( type : string ) : string

Returns the WGSL type of the given node data type.

**type**

The node data type.

**Overrides:** [NodeBuilder#getType](NodeBuilder.html#getType)

**Returns:** The WGSL type.

### .getUniformFromNode( node : UniformNode, type : string, shaderStage : string, name : string ) : NodeUniform

This method is one of the more important ones since it's responsible for generating a matching binding instance for the given uniform node.

These bindings are later used in the renderer to create bind groups and layouts.

**node**

The uniform node.

**type**

The node data type.

**shaderStage**

The shader stage.

**name**

An optional uniform name.

Default is `null`.

**Overrides:** [NodeBuilder#getUniformFromNode](NodeBuilder.html#getUniformFromNode)

**Returns:** The node uniform object.

### .getUniforms( shaderStage : string ) : string

Returns the uniforms of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getUniforms](NodeBuilder.html#getUniforms)

**Returns:** The WGSL snippet that defines the uniforms.

### .getVar( type : string, name : string, count : number ) : string

Returns a WGSL string representing a variable.

**type**

The variable's type.

**name**

The variable's name.

**count**

The array length.

Default is `null`.

**Overrides:** [NodeBuilder#getVar](NodeBuilder.html#getVar)

**Returns:** The WGSL snippet that defines a variable.

### .getVars( shaderStage : string ) : string

Returns the variables of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getVars](NodeBuilder.html#getVars)

**Returns:** The WGSL snippet that defines the variables.

### .getVaryings( shaderStage : string ) : string

Returns the varyings of the given shader stage as a WGSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getVaryings](NodeBuilder.html#getVaryings)

**Returns:** The WGSL snippet that defines the varyings.

### .getVertexIndex() : string

Returns the vertex index builtin.

**Overrides:** [NodeBuilder#getVertexIndex](NodeBuilder.html#getVertexIndex)

**Returns:** The vertex index.

### .hasBuiltin( name : string, shaderStage : string ) : boolean

Returns `true` if the given builtin is defined in the given shader stage.

**name**

The builtin name.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** Whether the given builtin is defined in the given shader stage or not.

### .isAvailable( name : string ) : boolean

Whether the requested feature is available or not.

**name**

The requested feature.

**Overrides:** [NodeBuilder#isAvailable](NodeBuilder.html#isAvailable)

**Returns:** Whether the requested feature is supported or not.

### .isFlipY() : boolean

Whether to flip texture data along its vertical axis or not.

**Overrides:** [NodeBuilder#isFlipY](NodeBuilder.html#isFlipY)

**Returns:** Returns always `false` in context of WGSL.

### .isSampleCompare( texture : Texture ) : boolean

Returns `true` if the sampled values of the given texture should be compared against a reference value.

**texture**

The texture.

**Returns:** Whether the sampled values of the given texture should be compared against a reference value or not.

### .isUnfilterable( texture : Texture ) : boolean

Returns `true` if the given texture is unfilterable.

**texture**

The texture.

**Returns:** Whether the given texture is unfilterable or not.

## Source

[src/renderers/webgpu/nodes/WGSLNodeBuilder.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webgpu/nodes/WGSLNodeBuilder.js)