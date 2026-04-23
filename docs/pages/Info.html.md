# Info

This renderer module provides a series of statistical information about the GPU memory and the rendering process. Useful for debugging and monitoring.

## Constructor

### new Info()

Constructs a new info component.

## Properties

### .autoReset : boolean

Whether frame related metrics should automatically be resetted or not. This property should be set to `false` by apps which manage their own animation loop. They must then call `renderer.info.reset()` once per frame manually.

Default is `true`.

### .calls : number (readonly)

The number of render calls since the app has been started.

Default is `0`.

### .compute : Object (readonly)

Compute related metrics.

**calls**  
number

The number of compute calls since the app has been started.

**frameCalls**  
number

The number of compute calls of the current frame.

**timestamp**  
number

The timestamp of the frame when using `renderer.computeAsync()`.

### .frame : number (readonly)

The current frame ID. This ID is managed by `NodeFrame`.

Default is `0`.

### .memory : Object (readonly)

Memory related metrics.

**geometries**  
number

The number of active geometries.

**textures**  
number

The number of active textures.

**attributes**  
number

The number of active attributes.

**indexAttributes**  
number

The number of active index attributes.

**storageAttributes**  
number

The number of active storage attributes.

**indirectStorageAttributes**  
number

The number of active indirect storage attributes.

**readbackBuffers**  
number

The number of active readback buffers.

**programs**  
number

The number of active programs.

**renderTargets**  
number

The number of active renderTargets.

**total**  
number

The total memory size in bytes.

**texturesSize**  
number

The memory size of active textures in bytes.

**attributesSize**  
number

The memory size of active attributes in bytes.

**indexAttributesSize**  
number

The memory size of active index attributes in bytes.

**storageAttributesSize**  
number

The memory size of active storage attributes in bytes.

**indirectStorageAttributesSize**  
number

The memory size of active indirect storage attributes in bytes.

**readbackBuffersSize**  
number

The memory size of active readback buffers in bytes.

**programsSize**  
number

The memory size of active programs in bytes.

### .render : Object (readonly)

Render related metrics.

**calls**  
number

The number of render calls since the app has been started.

**frameCalls**  
number

The number of render calls of the current frame.

**drawCalls**  
number

The number of draw calls of the current frame.

**triangles**  
number

The number of rendered triangle primitives of the current frame.

**points**  
number

The number of rendered point primitives of the current frame.

**lines**  
number

The number of rendered line primitives of the current frame.

**timestamp**  
number

The timestamp of the frame.

## Methods

### .createAttribute( attribute : BufferAttribute )

Tracks a regular attribute memory explicitly.

**attribute**

The attribute to track.

### .createIndexAttribute( attribute : BufferAttribute )

Tracks an index attribute memory explicitly.

**attribute**

The index attribute to track.

### .createIndirectStorageAttribute( attribute : BufferAttribute )

Tracks an indirect storage attribute memory explicitly.

**attribute**

The indirect storage attribute to track.

### .createProgram( program : ProgrammableStage )

Tracks program memory explicitly, updating counts and byte tracking.

**program**

The program to track.

### .createReadbackBuffer( readbackBuffer : ReadbackBuffer )

Tracks a readback buffer memory explicitly.

**readbackBuffer**

The readback buffer to track.

### .createStorageAttribute( attribute : BufferAttribute )

Tracks a storage attribute memory explicitly.

**attribute**

The storage attribute to track.

### .createTexture( texture : Texture )

Tracks texture memory explicitly, updating counts and byte tracking.

**texture**

### .destroyAttribute( attribute : BufferAttribute )

Tracks attribute memory explicitly, updating counts and byte tracking.

**attribute**

### .destroyProgram( program : Object )

Tracks program memory explicitly, updating counts and byte tracking.

**program**

The program to track.

### .destroyReadbackBuffer( readbackBuffer : ReadbackBuffer )

Tracks a readback buffer memory explicitly.

**readbackBuffer**

The readback buffer to track.

### .destroyTexture( texture : Texture )

Tracks texture memory explicitly, updating counts and byte tracking.

**texture**

### .dispose()

Performs a complete reset of the object.

### .reset()

Resets frame related metrics.

### .update( object : Object3D, count : number, instanceCount : number )

This method should be executed per draw call and updates the corresponding metrics.

**object**

The 3D object that is going to be rendered.

**count**

The vertex or index count.

**instanceCount**

The instance count.

## Source

[src/renderers/common/Info.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/Info.js)