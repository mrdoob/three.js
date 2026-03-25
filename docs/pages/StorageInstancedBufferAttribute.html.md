*Inheritance: BufferAttribute → InstancedBufferAttribute →*

# StorageInstancedBufferAttribute

This special type of instanced buffer attribute is intended for compute shaders. In earlier three.js versions it was only possible to update attribute data on the CPU via JavaScript and then upload the data to the GPU. With the new material system and renderer it is now possible to use compute shaders to compute the data for an attribute more efficiently on the GPU.

The idea is to create an instance of this class and provide it as an input to [StorageBufferNode](StorageBufferNode.html).

Note: This type of buffer attribute can only be used with `WebGPURenderer`.

## Constructor

### new StorageInstancedBufferAttribute( count : number | TypedArray, itemSize : number, typeClass : TypedArray.constructor )

Constructs a new storage instanced buffer attribute.

**count**

The item count. It is also valid to pass a typed array as an argument. The subsequent parameters are then obsolete.

**itemSize**

The item size.

**typeClass**

A typed array constructor.

Default is `Float32Array`.

## Properties

### .isStorageInstancedBufferAttribute : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/renderers/common/StorageInstancedBufferAttribute.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/StorageInstancedBufferAttribute.js)