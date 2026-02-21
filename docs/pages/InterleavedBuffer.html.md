# InterleavedBuffer

"Interleaved" means that multiple attributes, possibly of different types, (e.g., position, normal, uv, color) are packed into a single array buffer.

An introduction into interleaved arrays can be found here: [Interleaved array basics](https://blog.tojicode.com/2011/05/interleaved-array-basics.html)

## Constructor

### new InterleavedBuffer( array : TypedArray, stride : number )

Constructs a new interleaved buffer.

**array**

A typed array with a shared buffer storing attribute data.

**stride**

The number of typed-array elements per vertex.

## Properties

### .array : TypedArray

A typed array with a shared buffer storing attribute data.

### .count : number (readonly)

The total number of elements in the array

### .isInterleavedBuffer : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .needsUpdate : number

Flag to indicate that this attribute has changed and should be re-sent to the GPU. Set this to `true` when you modify the value of the array.

Default is `false`.

### .stride : number

The number of typed-array elements per vertex.

### .updateRanges : Array.<Object>

This can be used to only update some components of stored vectors (for example, just the component related to color). Use the `addUpdateRange()` function to add ranges to this array.

### .usage : StaticDrawUsage | DynamicDrawUsage | StreamDrawUsage | StaticReadUsage | DynamicReadUsage | StreamReadUsage | StaticCopyUsage | DynamicCopyUsage | StreamCopyUsage

Defines the intended usage pattern of the data store for optimization purposes.

Note: After the initial use of a buffer, its usage cannot be changed. Instead, instantiate a new one and set the desired usage before the next render.

Default is `StaticDrawUsage`.

### .uuid : string (readonly)

The UUID of the interleaved buffer.

### .version : number

A version number, incremented every time the `needsUpdate` is set to `true`.

## Methods

### .addUpdateRange( start : number, count : number )

Adds a range of data in the data array to be updated on the GPU.

**start**

Position at which to start update.

**count**

The number of components to update.

### .clearUpdateRanges()

Clears the update ranges.

### .clone( data : Object ) : InterleavedBuffer

Returns a new interleaved buffer with copied values from this instance.

**data**

An object with shared array buffers that allows to retain shared structures.

**Returns:** A clone of this instance.

### .copy( source : InterleavedBuffer ) : InterleavedBuffer

Copies the values of the given interleaved buffer to this instance.

**source**

The interleaved buffer to copy.

**Returns:** A reference to this instance.

### .copyAt( index1 : number, interleavedBuffer : InterleavedBuffer, index2 : number ) : InterleavedBuffer

Copies a vector from the given interleaved buffer to this one. The start and destination position in the attribute buffers are represented by the given indices.

**index1**

The destination index into this interleaved buffer.

**interleavedBuffer**

The interleaved buffer to copy from.

**index2**

The source index into the given interleaved buffer.

**Returns:** A reference to this instance.

### .onUpload( callback : function ) : InterleavedBuffer

Sets the given callback function that is executed after the Renderer has transferred the array data to the GPU. Can be used to perform clean-up operations after the upload when data are not needed anymore on the CPU side.

**callback**

The `onUpload()` callback.

**Returns:** A reference to this instance.

### .onUploadCallback()

A callback function that is executed after the renderer has transferred the attribute array data to the GPU.

### .set( value : TypedArray | Array, offset : number ) : InterleavedBuffer

Sets the given array data in the interleaved buffer.

**value**

The array data to set.

**offset**

The offset in this interleaved buffer's array.

Default is `0`.

**Returns:** A reference to this instance.

### .setUsage( value : StaticDrawUsage | DynamicDrawUsage | StreamDrawUsage | StaticReadUsage | DynamicReadUsage | StreamReadUsage | StaticCopyUsage | DynamicCopyUsage | StreamCopyUsage ) : InterleavedBuffer

Sets the usage of this interleaved buffer.

**value**

The usage to set.

**Returns:** A reference to this interleaved buffer.

### .toJSON( data : Object ) : Object

Serializes the interleaved buffer into JSON.

**data**

An optional value holding meta information about the serialization.

**Returns:** A JSON object representing the serialized interleaved buffer.

## Source

[src/core/InterleavedBuffer.js](https://github.com/mrdoob/three.js/blob/master/src/core/InterleavedBuffer.js)