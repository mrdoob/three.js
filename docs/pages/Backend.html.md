# Backend

Most of the rendering related logic is implemented in the [Renderer](Renderer.html) module and related management components. Sometimes it is required though to execute commands which are specific to the current 3D backend (which is WebGPU or WebGL 2). This abstract base class defines an interface that encapsulates all backend-related logic. Derived classes for each backend must implement the interface.

## Constructor

### new Backend( parameters : Object ) (abstract)

Constructs a new backend.

**parameters**

An object holding parameters for the backend.

## Properties

### .coordinateSystem : number (abstract, readonly)

The coordinate system of the backend.

### .data : WeakMap.<Object, Object>

This weak map holds backend-specific data of objects like textures, attributes or render targets.

### .domElement : HTMLCanvasElement | OffscreenCanvas

A reference to the canvas element the renderer is drawing to.

Default is `null`.

### .hasTimestamp : boolean (readonly)

Whether the backend supports query timestamps or not.

### .parameters : Object

The parameters of the backend.

### .renderer : Renderer

A reference to the renderer.

Default is `null`.

### .timestampQueryPool : Object

A reference to the timestamp query pool.

### .trackTimestamp : boolean

Whether to track timestamps with a Timestamp Query API or not.

Default is `false`.

## Methods

### ._getQueryPool( uid : string ) : TimestampQueryPool

Returns the query pool for the given uid.

**uid**

The unique identifier.

**Returns:** The query pool.

### .beginCompute( computeGroup : Node | Array.<Node> ) (abstract)

This method is executed at the beginning of a compute call and can be used by the backend to prepare the state for upcoming compute tasks.

**computeGroup**

The compute node(s).

### .beginRender( renderContext : RenderContext ) (abstract)

This method is executed at the beginning of a render call and can be used by the backend to prepare the state for upcoming draw calls.

**renderContext**

The render context.

### .compute( computeGroup : Node | Array.<Node>, computeNode : Node, bindings : Array.<BindGroup>, computePipeline : ComputePipeline ) (abstract)

Executes a compute command for the given compute node.

**computeGroup**

The group of compute nodes of a compute call. Can be a single compute node.

**computeNode**

The compute node.

**bindings**

The bindings.

**computePipeline**

The compute pipeline.

### .copyFramebufferToTexture( texture : Texture, renderContext : RenderContext, rectangle : Vector4 ) (abstract)

Copies the current bound framebuffer to the given texture.

**texture**

The destination texture.

**renderContext**

The render context.

**rectangle**

A four dimensional vector defining the origin and dimension of the copy.

### .copyTextureToBuffer( texture : Texture, x : number, y : number, width : number, height : number, faceIndex : number ) : Promise.<TypedArray> (async, abstract)

Returns texture data as a typed array.

**texture**

The texture to copy.

**x**

The x coordinate of the copy origin.

**y**

The y coordinate of the copy origin.

**width**

The width of the copy.

**height**

The height of the copy.

**faceIndex**

The face index.

**Returns:** A Promise that resolves with a typed array when the copy operation has finished.

### .copyTextureToTexture( srcTexture : Texture, dstTexture : Texture, srcRegion : Box3 | Box2, dstPosition : Vector2 | Vector3, srcLevel : number, dstLevel : number ) (abstract)

Copies data of the given source texture to the given destination texture.

**srcTexture**

The source texture.

**dstTexture**

The destination texture.

**srcRegion**

The region of the source texture to copy.

Default is `null`.

**dstPosition**

The destination position of the copy.

Default is `null`.

**srcLevel**

The source mip level to copy from.

Default is `0`.

**dstLevel**

The destination mip level to copy to.

Default is `0`.

### .createAttribute( attribute : BufferAttribute ) (abstract)

Creates the GPU buffer of a shader attribute.

**attribute**

The buffer attribute.

### .createBindings( bindGroup : BindGroup, bindings : Array.<BindGroup>, cacheIndex : number, version : number ) (abstract)

Creates bindings from the given bind group definition.

**bindGroup**

The bind group.

**bindings**

Array of bind groups.

**cacheIndex**

The cache index.

**version**

The version.

### .createComputePipeline( computePipeline : ComputePipeline, bindings : Array.<BindGroup> ) (abstract)

Creates a compute pipeline for the given compute node.

**computePipeline**

The compute pipeline.

**bindings**

The bindings.

### .createDefaultTexture( texture : Texture ) (abstract)

Creates a default texture for the given texture that can be used as a placeholder until the actual texture is ready for usage.

**texture**

The texture to create a default texture for.

### .createIndexAttribute( attribute : BufferAttribute ) (abstract)

Creates the GPU buffer of an indexed shader attribute.

**attribute**

The indexed buffer attribute.

### .createNodeBuilder( renderObject : RenderObject, renderer : Renderer ) : NodeBuilder (abstract)

Returns a node builder for the given render object.

**renderObject**

The render object.

**renderer**

The renderer.

**Returns:** The node builder.

### .createProgram( program : ProgrammableStage ) (abstract)

Creates a shader program from the given programmable stage.

**program**

The programmable stage.

### .createRenderPipeline( renderObject : RenderObject, promises : Array.<Promise> ) (abstract)

Creates a render pipeline for the given render object.

**renderObject**

The render object.

**promises**

An array of compilation promises which are used in `compileAsync()`.

### .createStorageAttribute( attribute : BufferAttribute ) (abstract)

Creates the GPU buffer of a storage attribute.

**attribute**

The buffer attribute.

### .createTexture( texture : Texture, options : Object ) (abstract)

Defines a texture on the GPU for the given texture object.

**texture**

The texture.

**options**

Optional configuration parameter.

Default is `{}`.

### .createUniformBuffer( uniformBuffer : Buffer ) (abstract)

Creates a uniform buffer.

**uniformBuffer**

The uniform buffer.

### .delete( object : Object )

Deletes an object from the internal data structure.

**object**

The object to delete.

### .deleteBindGroupData( bindGroup : BindGroup ) (abstract)

Delete GPU data associated with a bind group.

**bindGroup**

The bind group.

### .destroyAttribute( attribute : BufferAttribute ) (abstract)

Destroys the GPU buffer of a shader attribute.

**attribute**

The buffer attribute to destroy.

### .destroyProgram( program : ProgrammableStage ) (abstract)

Destroys the shader program of the given programmable stage.

**program**

The programmable stage.

### .destroySampler( binding : Sampler ) (abstract)

Frees the GPU sampler for the given sampler binding.

**binding**

The sampler binding to free.

### .destroyTexture( texture : Texture, isDefaultTexture : boolean ) (abstract)

Destroys the GPU data for the given texture object.

**texture**

The texture.

**isDefaultTexture**

Whether the texture uses a default GPU texture or not.

Default is `false`.

### .destroyUniformBuffer( uniformBuffer : Buffer ) (abstract)

Destroys a uniform buffer.

**uniformBuffer**

The uniform buffer.

### .dispose() (abstract)

Frees internal resources.

### .draw( renderObject : RenderObject, info : Info ) (abstract)

Executes a draw command for the given render object.

**renderObject**

The render object to draw.

**info**

Holds a series of statistical information about the GPU memory and the rendering process.

### .finishCompute( computeGroup : Node | Array.<Node> ) (abstract)

This method is executed at the end of a compute call and can be used by the backend to finalize work after compute tasks.

**computeGroup**

The compute node(s).

### .finishRender( renderContext : RenderContext ) (abstract)

This method is executed at the end of a render call and can be used by the backend to finalize work after draw calls.

**renderContext**

The render context.

### .generateMipmaps( texture : Texture ) (abstract)

Generates mipmaps for the given texture.

**texture**

The texture.

### .get( object : Object ) : Object

Returns the dictionary for the given object.

**object**

The object.

**Returns:** The object's dictionary.

### .getArrayBufferAsync( attribute : StorageBufferAttribute ) : Promise.<ArrayBuffer> (async)

This method performs a readback operation by moving buffer data from a storage buffer attribute from the GPU to the CPU.

**attribute**

The storage buffer attribute.

**Returns:** A promise that resolves with the buffer data when the data are ready.

### .getClearColor() : Color4

Returns the clear color and alpha into a single color object.

**Returns:** The clear color.

### .getContext() : Object (abstract)

Returns the backend's rendering context.

**Returns:** The rendering context.

### .getDomElement() : HTMLCanvasElement

Returns the DOM element. If no DOM element exists, the backend creates a new one.

**Returns:** The DOM element.

### .getDrawingBufferSize() : Vector2

Returns the drawing buffer size.

**Returns:** The drawing buffer size.

### .getRenderCacheKey( renderObject : RenderObject ) : string (abstract)

Returns a cache key that is used to identify render pipelines.

**renderObject**

The render object.

**Returns:** The cache key.

### .getTimestamp( uid : string ) : number

Returns the timestamp for the given uid.

**uid**

The unique identifier.

**Returns:** The timestamp.

### .getTimestampFrames( type : string ) : Array.<number>

Returns all timestamp frames for the given type.

**type**

The type of the time stamp.

**Returns:** The timestamp frames.

### .getTimestampUID( abstractRenderContext : RenderContext | ComputeNode ) : string

Returns a unique identifier for the given render context that can be used to allocate resources like occlusion queries or timestamp queries.

**abstractRenderContext**

The render context.

**Returns:** The unique identifier.

### .has( object : Object ) : boolean

Checks if the given object has a dictionary with data defined.

**object**

The object.

**Returns:** Whether a dictionary for the given object as been defined or not.

### .hasCompatibility( name : string ) : boolean (abstract)

Checks if the backend has the given compatibility.

**name**

The compatibility.

**Returns:** Whether the backend has the given compatibility or not.

### .hasFeature( name : string ) : boolean (abstract)

Checks if the given feature is supported by the backend.

**name**

The feature's name.

**Returns:** Whether the feature is supported or not.

### .hasFeatureAsync( name : string ) : Promise.<boolean> (async, abstract)

Checks if the given feature is supported by the backend.

**name**

The feature's name.

**Returns:** A Promise that resolves with a bool that indicates whether the feature is supported or not.

### .hasTimestampQuery( uid : string ) : boolean

Returns `true` if a timestamp for the given uid is available.

**uid**

The unique identifier.

**Returns:** Whether the timestamp is available or not.

### .init( renderer : Renderer ) : Promise (async)

Initializes the backend so it is ready for usage. Concrete backends are supposed to implement their rendering context creation and related operations in this method.

**renderer**

The renderer.

**Returns:** A Promise that resolves when the backend has been initialized.

### .initRenderTarget( renderContext : RenderContext ) (abstract)

Initializes the render target defined in the given render context.

**renderContext**

The render context.

### .isOccluded( renderContext : RenderContext, object : Object3D ) : boolean (abstract)

Returns `true` if the given 3D object is fully occluded by other 3D objects in the scene. Backends must implement this method by using a Occlusion Query API.

**renderContext**

The render context.

**object**

The 3D object to test.

**Returns:** Whether the 3D object is fully occluded or not.

### .needsRenderUpdate( renderObject : RenderObject ) : boolean (abstract)

Returns `true` if the render pipeline requires an update.

**renderObject**

The render object.

**Returns:** Whether the render pipeline requires an update or not.

### .resolveTimestampsAsync( type : string ) : Promise.<number> (async, abstract)

Resolves the time stamp for the given render context and type.

**type**

The type of the time stamp.

Default is `'render'`.

**Returns:** A Promise that resolves with the time stamp.

### .set( object : Object, value : Object )

Sets a dictionary for the given object into the internal data structure.

**object**

The object.

**value**

The dictionary to set.

### .setScissorTest( boolean : boolean ) (abstract)

Defines the scissor test.

**boolean**

Whether the scissor test should be enabled or not.

### .setXRTarget( xrTarget : Object )

Sets the XR rendering destination.

Backends that render directly into XR framebuffers can override this hook.

**xrTarget**

The XR rendering destination.

### .updateAttribute( attribute : BufferAttribute ) (abstract)

Updates the GPU buffer of a shader attribute.

**attribute**

The buffer attribute to update.

### .updateBinding( binding : Buffer ) (abstract)

Updates a buffer binding.

**binding**

The buffer binding to update.

### .updateBindings( bindGroup : BindGroup, bindings : Array.<BindGroup>, cacheIndex : number, version : number ) (abstract)

Updates the given bind group definition.

**bindGroup**

The bind group.

**bindings**

Array of bind groups.

**cacheIndex**

The cache index.

**version**

The version.

### .updateSampler( binding : Sampler ) : string (abstract)

Updates a GPU sampler for the given texture.

**binding**

The sampler binding to update.

**Returns:** The current sampler key.

### .updateSize() (abstract)

Backends can use this method if they have to run logic when the renderer gets resized.

### .updateTexture( texture : Texture, options : Object ) (abstract)

Uploads the updated texture data to the GPU.

**texture**

The texture.

**options**

Optional configuration parameter.

Default is `{}`.

### .updateTimeStampUID( abstractRenderContext : RenderContext | ComputeNode )

Updates a unique identifier for the given render context that can be used to allocate resources like occlusion queries or timestamp queries.

**abstractRenderContext**

The render context.

### .updateViewport( renderContext : RenderContext ) (abstract)

Updates the viewport with the values from the given render context.

**renderContext**

The render context.

## Source

[src/renderers/common/Backend.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/Backend.js)