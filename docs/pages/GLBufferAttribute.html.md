# GLBufferAttribute

An alternative version of a buffer attribute with more control over the VBO.

The renderer does not construct a VBO for this kind of attribute. Instead, it uses whatever VBO is passed in constructor and can later be altered via the `buffer` property.

The most common use case for this class is when some kind of GPGPU calculation interferes or even produces the VBOs in question.

Notice that this class can only be used with [WebGLRenderer](WebGLRenderer.html).

## Constructor

### new GLBufferAttribute( buffer : WebGLBuffer, type : number, itemSize : number, elementSize : number, count : number, normalized : boolean )

Constructs a new GL buffer attribute.

**buffer**

The native WebGL buffer.

**type**

The native data type (e.g. `gl.FLOAT`).

**itemSize**

The item size.

**elementSize**

The corresponding size (in bytes) for the given `type` parameter.

**count**

The expected number of vertices in VBO.

**normalized**

Whether the data are normalized or not.

Default is `false`.

## Properties

### .buffer : WebGLBuffer

The native WebGL buffer.

### .count : number

The expected number of vertices in VBO.

### .elementSize : number

The corresponding size (in bytes) for the given `type` parameter.

### .isGLBufferAttribute : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .itemSize : number

The item size, see [BufferAttribute#itemSize](BufferAttribute.html#itemSize).

### .name : string

The name of the buffer attribute.

### .needsUpdate : number

Flag to indicate that this attribute has changed and should be re-sent to the GPU. Set this to `true` when you modify the value of the array.

Default is `false`.

### .normalized : boolean

Applies to integer data only. Indicates how the underlying data in the buffer maps to the values in the GLSL code. For instance, if `buffer` contains data of `gl.UNSIGNED_SHORT`, and `normalized` is `true`, the values `0 - +65535` in the buffer data will be mapped to `0.0f - +1.0f` in the GLSL attribute. If `normalized` is `false`, the values will be converted to floats unmodified, i.e. `65535` becomes `65535.0f`.

### .type : number

The native data type.

### .version : number

A version number, incremented every time the `needsUpdate` is set to `true`.

## Methods

### .setBuffer( buffer : WebGLBuffer ) : BufferAttribute

Sets the given native WebGL buffer.

**buffer**

The buffer to set.

**Returns:** A reference to this instance.

### .setCount( count : number ) : BufferAttribute

Sets the count (the expected number of vertices in VBO).

**count**

The count.

**Returns:** A reference to this instance.

### .setItemSize( itemSize : number ) : BufferAttribute

Sets the item size.

**itemSize**

The item size.

**Returns:** A reference to this instance.

### .setType( type : number, elementSize : number ) : BufferAttribute

Sets the given native data type and element size.

**type**

The native data type (e.g. `gl.FLOAT`).

**elementSize**

The corresponding size (in bytes) for the given `type` parameter.

**Returns:** A reference to this instance.

## Source

[src/core/GLBufferAttribute.js](https://github.com/mrdoob/three.js/blob/master/src/core/GLBufferAttribute.js)