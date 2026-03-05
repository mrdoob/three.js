*Inheritance: InterleavedBuffer →*

# InstancedInterleavedBuffer

An instanced version of an interleaved buffer.

## Constructor

### new InstancedInterleavedBuffer( array : TypedArray, stride : number, meshPerAttribute : number )

Constructs a new instanced interleaved buffer.

**array**

A typed array with a shared buffer storing attribute data.

**stride**

The number of typed-array elements per vertex.

**meshPerAttribute**

Defines how often a value of this interleaved buffer should be repeated.

Default is `1`.

## Properties

### .isInstancedInterleavedBuffer : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .meshPerAttribute : number

Defines how often a value of this buffer attribute should be repeated, see [InstancedBufferAttribute#meshPerAttribute](InstancedBufferAttribute.html#meshPerAttribute).

Default is `1`.

## Source

[src/core/InstancedInterleavedBuffer.js](https://github.com/mrdoob/three.js/blob/master/src/core/InstancedInterleavedBuffer.js)