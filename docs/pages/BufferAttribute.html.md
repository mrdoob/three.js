# BufferAttribute

This class stores data for an attribute (such as vertex positions, face indices, normals, colors, UVs, and any custom attributes ) associated with a geometry, which allows for more efficient passing of data to the GPU.

When working with vector-like data, the `fromBufferAttribute( attribute, index )` helper methods on vector and color class might be helpful. E.g. [Vector3#fromBufferAttribute](Vector3.html#fromBufferAttribute).

## Constructor

### new BufferAttribute( array : TypedArray, itemSize : number, normalized : boolean )

Constructs a new buffer attribute.

**array**

The array holding the attribute data.

**itemSize**

The item size.

**normalized**

Whether the data are normalized or not.

Default is `false`.

## Properties

### .array : TypedArray

The array holding the attribute data. It should have `itemSize * numVertices` elements, where `numVertices` is the number of vertices in the associated geometry.

### .count : number (readonly)

Represents the number of items this buffer attribute stores. It is internally computed by dividing the `array` length by the `itemSize`.

### .gpuType : FloatType | IntType

Configures the bound GPU type for use in shaders.

Note: this only has an effect for integer arrays and is not configurable for float arrays. For lower precision float types, use `Float16BufferAttribute`.

Default is `FloatType`.

### .id : number (readonly)

The ID of the buffer attribute.

### .isBufferAttribute : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .itemSize : number

The number of values of the array that should be associated with a particular vertex. For instance, if this attribute is storing a 3-component vector (such as a position, normal, or color), then the value should be `3`.

### .name : string

The name of the buffer attribute.

### .needsUpdate : number

Flag to indicate that this attribute has changed and should be re-sent to the GPU. Set this to `true` when you modify the value of the array.

Default is `false`.

### .normalized : boolean

Applies to integer data only. Indicates how the underlying data in the buffer maps to the values in the GLSL code. For instance, if `array` is an instance of `UInt16Array`, and `normalized` is `true`, the values `0 - +65535` in the array data will be mapped to `0.0f - +1.0f` in the GLSL attribute. If `normalized` is `false`, the values will be converted to floats unmodified, i.e. `65535` becomes `65535.0f`.

### .updateRanges : Array.<Object>

This can be used to only update some components of stored vectors (for example, just the component related to color). Use the `addUpdateRange()` function to add ranges to this array.

### .usage : StaticDrawUsage | DynamicDrawUsage | StreamDrawUsage | StaticReadUsage | DynamicReadUsage | StreamReadUsage | StaticCopyUsage | DynamicCopyUsage | StreamCopyUsage

Defines the intended usage pattern of the data store for optimization purposes.

Note: After the initial use of a buffer, its usage cannot be changed. Instead, instantiate a new one and set the desired usage before the next render.

Default is `StaticDrawUsage`.

### .version : number

A version number, incremented every time the `needsUpdate` is set to `true`.

## Methods

### .addUpdateRange( start : number, count : number )

Adds a range of data in the data array to be updated on the GPU.

**start**

Position at which to start update.

**count**

The number of components to update.

### .applyMatrix3( m : Matrix3 ) : BufferAttribute

Applies the given 3x3 matrix to the given attribute. Works with item size `2` and `3`.

**m**

The matrix to apply.

**Returns:** A reference to this instance.

### .applyMatrix4( m : Matrix4 ) : BufferAttribute

Applies the given 4x4 matrix to the given attribute. Only works with item size `3`.

**m**

The matrix to apply.

**Returns:** A reference to this instance.

### .applyNormalMatrix( m : Matrix3 ) : BufferAttribute

Applies the given 3x3 normal matrix to the given attribute. Only works with item size `3`.

**m**

The normal matrix to apply.

**Returns:** A reference to this instance.

### .clearUpdateRanges()

Clears the update ranges.

### .clone() : BufferAttribute

Returns a new buffer attribute with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( source : BufferAttribute ) : BufferAttribute

Copies the values of the given buffer attribute to this instance.

**source**

The buffer attribute to copy.

**Returns:** A reference to this instance.

### .copyArray( array : TypedArray | Array ) : BufferAttribute

Copies the given array data into this buffer attribute.

**array**

The array to copy.

**Returns:** A reference to this instance.

### .copyAt( index1 : number, attribute : BufferAttribute, index2 : number ) : BufferAttribute

Copies a vector from the given buffer attribute to this one. The start and destination position in the attribute buffers are represented by the given indices.

**index1**

The destination index into this buffer attribute.

**attribute**

The buffer attribute to copy from.

**index2**

The source index into the given buffer attribute.

**Returns:** A reference to this instance.

### .getComponent( index : number, component : number ) : number

Returns the given component of the vector at the given index.

**index**

The index into the buffer attribute.

**component**

The component index.

**Returns:** The returned value.

### .getW( index : number ) : number

Returns the w component of the vector at the given index.

**index**

The index into the buffer attribute.

**Returns:** The w component.

### .getX( index : number ) : number

Returns the x component of the vector at the given index.

**index**

The index into the buffer attribute.

**Returns:** The x component.

### .getY( index : number ) : number

Returns the y component of the vector at the given index.

**index**

The index into the buffer attribute.

**Returns:** The y component.

### .getZ( index : number ) : number

Returns the z component of the vector at the given index.

**index**

The index into the buffer attribute.

**Returns:** The z component.

### .onUpload( callback : function ) : BufferAttribute

Sets the given callback function that is executed after the Renderer has transferred the attribute array data to the GPU. Can be used to perform clean-up operations after the upload when attribute data are not needed anymore on the CPU side.

**callback**

The `onUpload()` callback.

**Returns:** A reference to this instance.

### .onUploadCallback()

A callback function that is executed after the renderer has transferred the attribute array data to the GPU.

### .set( value : TypedArray | Array, offset : number ) : BufferAttribute

Sets the given array data in the buffer attribute.

**value**

The array data to set.

**offset**

The offset in this buffer attribute's array.

Default is `0`.

**Returns:** A reference to this instance.

### .setComponent( index : number, component : number, value : number ) : BufferAttribute

Sets the given value to the given component of the vector at the given index.

**index**

The index into the buffer attribute.

**component**

The component index.

**value**

The value to set.

**Returns:** A reference to this instance.

### .setUsage( value : StaticDrawUsage | DynamicDrawUsage | StreamDrawUsage | StaticReadUsage | DynamicReadUsage | StreamReadUsage | StaticCopyUsage | DynamicCopyUsage | StreamCopyUsage ) : BufferAttribute

Sets the usage of this buffer attribute.

**value**

The usage to set.

**Returns:** A reference to this buffer attribute.

### .setW( index : number, w : number ) : BufferAttribute

Sets the w component of the vector at the given index.

**index**

The index into the buffer attribute.

**w**

The value to set.

**Returns:** A reference to this instance.

### .setX( index : number, x : number ) : BufferAttribute

Sets the x component of the vector at the given index.

**index**

The index into the buffer attribute.

**x**

The value to set.

**Returns:** A reference to this instance.

### .setXY( index : number, x : number, y : number ) : BufferAttribute

Sets the x and y component of the vector at the given index.

**index**

The index into the buffer attribute.

**x**

The value for the x component to set.

**y**

The value for the y component to set.

**Returns:** A reference to this instance.

### .setXYZ( index : number, x : number, y : number, z : number ) : BufferAttribute

Sets the x, y and z component of the vector at the given index.

**index**

The index into the buffer attribute.

**x**

The value for the x component to set.

**y**

The value for the y component to set.

**z**

The value for the z component to set.

**Returns:** A reference to this instance.

### .setXYZW( index : number, x : number, y : number, z : number, w : number ) : BufferAttribute

Sets the x, y, z and w component of the vector at the given index.

**index**

The index into the buffer attribute.

**x**

The value for the x component to set.

**y**

The value for the y component to set.

**z**

The value for the z component to set.

**w**

The value for the w component to set.

**Returns:** A reference to this instance.

### .setY( index : number, y : number ) : BufferAttribute

Sets the y component of the vector at the given index.

**index**

The index into the buffer attribute.

**y**

The value to set.

**Returns:** A reference to this instance.

### .setZ( index : number, z : number ) : BufferAttribute

Sets the z component of the vector at the given index.

**index**

The index into the buffer attribute.

**z**

The value to set.

**Returns:** A reference to this instance.

### .toJSON() : Object

Serializes the buffer attribute into JSON.

**Returns:** A JSON object representing the serialized buffer attribute.

### .transformDirection( m : Matrix4 ) : BufferAttribute

Applies the given 4x4 matrix to the given attribute. Only works with item size `3` and with direction vectors.

**m**

The matrix to apply.

**Returns:** A reference to this instance.

## Source

[src/core/BufferAttribute.js](https://github.com/mrdoob/three.js/blob/master/src/core/BufferAttribute.js)