*Inheritance: NodeBuilder →*

# GLSLNodeBuilder

A node builder targeting GLSL.

This module generates GLSL shader code from node materials and also generates the respective bindings and vertex buffer definitions. These data are later used by the renderer to create render and compute pipelines for render objects.

## Constructor

### new GLSLNodeBuilder( object : Object3D, renderer : Renderer )

Constructs a new GLSL node builder renderer.

**object**

The 3D object.

**renderer**

The renderer.

## Properties

### .builtins : Object.<string, Array.<string>>

A dictionary that holds for each shader stage an Array of used builtins.

### .extensions : Object.<string, Map.<string, Object>>

A dictionary that holds for each shader stage a Map of used extensions.

### .transforms : Array.<Object.<string, (AttributeNode|string)>>

An array that holds objects defining the varying and attribute data in context of Transform Feedback.

### .uniformGroups : Object.<string, Object.<string, NodeUniformsGroup>>

A dictionary holds for each shader stage ('vertex', 'fragment', 'compute') another dictionary which manages UBOs per group ('render','frame','object').

## Methods

### .buildCode()

Controls the code build of the shader stages.

**Overrides:** [NodeBuilder#buildCode](NodeBuilder.html#buildCode)

### .buildFunctionCode( shaderNode : ShaderNodeInternal ) : string

Builds the given shader node.

**shaderNode**

The shader node.

**Overrides:** [NodeBuilder#buildFunctionCode](NodeBuilder.html#buildFunctionCode)

**Returns:** The GLSL function code.

### .enableExtension( name : string, behavior : string, shaderStage : string )

Enables the given extension.

**name**

The extension name.

**behavior**

The extension behavior.

**shaderStage**

The shader stage.

Default is `this.shaderStage`.

### .enableHardwareClipping( planeCount : string )

Enables hardware clipping.

**planeCount**

The clipping plane count.

### .enableMultiview()

Enables multiview.

### .generatePBO( storageArrayElementNode : StorageArrayElementNode ) : string

Setups the Pixel Buffer Object (PBO) for the given storage buffer node.

**storageArrayElementNode**

The storage array element node.

**Returns:** The property name.

### .generateTexture( texture : Texture, textureProperty : string, uvSnippet : string, depthSnippet : string, offsetSnippet : string ) : string

Generates the GLSL snippet for sampling/loading the given texture.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A GLSL snippet that represents texture coordinates used for sampling.

**depthSnippet**

A GLSL snippet that represents the 0-based texture array index to sample.

**offsetSnippet**

A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**Overrides:** [NodeBuilder#generateTexture](NodeBuilder.html#generateTexture)

**Returns:** The GLSL snippet.

### .generateTextureBias( texture : Texture, textureProperty : string, uvSnippet : string, biasSnippet : string, depthSnippet : string, offsetSnippet : string ) : string

Generates the GLSL snippet when sampling textures with a bias to the mip level.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A GLSL snippet that represents texture coordinates used for sampling.

**biasSnippet**

A GLSL snippet that represents the bias to apply to the mip level before sampling.

**depthSnippet**

A GLSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**Returns:** The GLSL snippet.

### .generateTextureCompare( texture : Texture, textureProperty : string, uvSnippet : string, compareSnippet : string, depthSnippet : string, offsetSnippet : string, shaderStage : string ) : string

Generates the GLSL snippet for sampling a depth texture and comparing the sampled depth values against a reference value.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A GLSL snippet that represents texture coordinates used for sampling.

**compareSnippet**

A GLSL snippet that represents the reference value.

**depthSnippet**

A GLSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Returns:** The GLSL snippet.

### .generateTextureGrad( texture : Texture, textureProperty : string, uvSnippet : string, gradSnippet : Array.<string>, depthSnippet : string, offsetSnippet : string ) : string

Generates the GLSL snippet for sampling/loading the given texture using explicit gradients.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A GLSL snippet that represents texture coordinates used for sampling.

**gradSnippet**

An array holding both gradient GLSL snippets.

**depthSnippet**

A GLSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**Returns:** The GLSL snippet.

### .generateTextureLevel( texture : Texture, textureProperty : string, uvSnippet : string, levelSnippet : string, depthSnippet : string, offsetSnippet : string ) : string

Generates the GLSL snippet when sampling textures with explicit mip level.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvSnippet**

A GLSL snippet that represents texture coordinates used for sampling.

**levelSnippet**

A GLSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

**depthSnippet**

A GLSL snippet that represents 0-based texture array index to sample.

**offsetSnippet**

A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**Returns:** The GLSL snippet.

### .generateTextureLoad( texture : Texture, textureProperty : string, uvIndexSnippet : string, levelSnippet : string, depthSnippet : string, offsetSnippet : string ) : string

Generates the GLSL snippet that reads a single texel from a texture without sampling or filtering.

**texture**

The texture.

**textureProperty**

The name of the texture uniform in the shader.

**uvIndexSnippet**

A GLSL snippet that represents texture coordinates used for sampling.

**levelSnippet**

A GLSL snippet that represents the mip level, with level 0 containing a full size version of the texture.

**depthSnippet**

A GLSL snippet that represents the 0-based texture array index to sample.

**offsetSnippet**

A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.

**Returns:** The GLSL snippet.

### .getAttributes( shaderStage : string ) : string

Returns the shader attributes of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getAttributes](NodeBuilder.html#getAttributes)

**Returns:** The GLSL snippet that defines the shader attributes.

### .getBitcastMethod( type : string, inputType : string ) : string

Returns the bitcast method name for a given input and outputType.

**type**

The output type to bitcast to.

**inputType**

The input type of the.

**Returns:** The resolved WGSL bitcast invocation.

### .getClipDistance() : string

Returns the clip distances builtin.

**Returns:** The clip distances builtin.

### .getDrawIndex() : string

Returns the draw index builtin.

**Overrides:** [NodeBuilder#getDrawIndex](NodeBuilder.html#getDrawIndex)

**Returns:** The drawIndex shader string. Returns `null` if `WEBGL_multi_draw` isn't supported by the device.

### .getExtensions( shaderStage : string ) : string

Returns the enabled extensions of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Returns:** The GLSL snippet that defines the enabled extensions.

### .getFloatPackingMethod( encoding : string ) : string

Returns the float packing method name for a given numeric encoding.

**encoding**

The numeric encoding that describes how the float values are mapped to the integer range.

**Returns:** The resolved GLSL float packing method name.

### .getFloatUnpackingMethod( encoding : string ) : string

Returns the float unpacking method name for a given numeric encoding.

**encoding**

The numeric encoding that describes how the integer values are mapped to the float range.

**Returns:** The resolved GLSL float unpacking method name.

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

### .getInstanceIndex() : string

Contextually returns either the vertex stage instance index builtin or the linearized index of an compute invocation within a grid of workgroups.

**Overrides:** [NodeBuilder#getInstanceIndex](NodeBuilder.html#getInstanceIndex)

**Returns:** The instance index.

### .getInvocationLocalIndex() : string

Returns a builtin representing the index of an invocation within its workgroup.

**Returns:** The invocation local index.

### .getInvocationSubgroupIndex()

Returns a builtin representing the index of an invocation within its subgroup.

### .getMethod( method : string ) : string

Returns the native shader method name for a given generic name.

**method**

The method name to resolve.

**Overrides:** [NodeBuilder#getMethod](NodeBuilder.html#getMethod)

**Returns:** The resolved GLSL method name.

### .getOutputStructName() : string

Returns the output struct name. Not relevant for GLSL.

**Overrides:** [NodeBuilder#getOutputStructName](NodeBuilder.html#getOutputStructName)

### .getPropertyName( node : Node, shaderStage : string ) : string

Returns a GLSL snippet that represents the property name of the given node.

**node**

The node.

**shaderStage**

The shader stage this code snippet is generated for.

Default is `this.shaderStage`.

**Overrides:** [NodeBuilder#getPropertyName](NodeBuilder.html#getPropertyName)

**Returns:** The property name.

### .getStructMembers( struct : StructTypeNode ) : string

Returns the members of the given struct type node as a GLSL string.

**struct**

The struct type node.

**Returns:** The GLSL snippet that defines the struct members.

### .getStructs( shaderStage : string ) : string

Returns the structs of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Returns:** The GLSL snippet that defines the structs.

### .getSubgroupIndex()

Returns a builtin representing the index of the current invocation's subgroup within its workgroup.

### .getSubgroupSize()

Returns a builtin representing the size of a subgroup within the current shader.

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

### .getTransforms( shaderStage : string ) : string

Returns the transforms of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Returns:** The GLSL snippet that defines the transforms.

### .getTypeFromAttribute( attribute : BufferAttribute ) : string

Returns the type for a given buffer attribute.

**attribute**

The buffer attribute.

**Overrides:** [NodeBuilder#getTypeFromAttribute](NodeBuilder.html#getTypeFromAttribute)

**Returns:** The type.

### .getUniformBufferLimit() : number

Returns the maximum number of bytes available for uniform buffers.

**Overrides:** [NodeBuilder#getUniformBufferLimit](NodeBuilder.html#getUniformBufferLimit)

**Returns:** The maximum number of bytes available for uniform buffers.

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

Returns the uniforms of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getUniforms](NodeBuilder.html#getUniforms)

**Returns:** The GLSL snippet that defines the uniforms.

### .getVars( shaderStage : string ) : string

Returns the variables of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getVars](NodeBuilder.html#getVars)

**Returns:** The GLSL snippet that defines the variables.

### .getVaryings( shaderStage : string ) : string

Returns the varyings of the given shader stage as a GLSL string.

**shaderStage**

The shader stage.

**Overrides:** [NodeBuilder#getVaryings](NodeBuilder.html#getVaryings)

**Returns:** The GLSL snippet that defines the varyings.

### .getVertexIndex() : string

Returns the vertex index builtin.

**Overrides:** [NodeBuilder#getVertexIndex](NodeBuilder.html#getVertexIndex)

**Returns:** The vertex index.

### .isAvailable( name : string ) : boolean

Whether the requested feature is available or not.

**name**

The requested feature.

**Overrides:** [NodeBuilder#isAvailable](NodeBuilder.html#isAvailable)

**Returns:** Whether the requested feature is supported or not.

### .isFlipY() : boolean

Whether to flip texture data along its vertical axis or not.

**Overrides:** [NodeBuilder#isFlipY](NodeBuilder.html#isFlipY)

**Returns:** Returns always `true` in context of GLSL.

### .needsToWorkingColorSpace( texture : Texture ) : boolean

Checks if the given texture requires a manual conversion to the working color space.

**texture**

The texture to check.

**Overrides:** [NodeBuilder#needsToWorkingColorSpace](NodeBuilder.html#needsToWorkingColorSpace)

**Returns:** Whether the given texture requires a conversion to working color space or not.

### .registerTransform( varyingName : string, attributeNode : AttributeNode )

Registers a transform in context of Transform Feedback.

**varyingName**

The varying name.

**attributeNode**

The attribute node.

### .setupPBO( storageBufferNode : StorageBufferNode )

Setups the Pixel Buffer Object (PBO) for the given storage buffer node.

**storageBufferNode**

The storage buffer node.

## Source

[src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js)