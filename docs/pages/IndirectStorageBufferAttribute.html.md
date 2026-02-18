*Inheritance: BufferAttribute → StorageBufferAttribute →*

# IndirectStorageBufferAttribute

This special type of buffer attribute is intended for compute shaders. It can be used to encode draw parameters for indirect draw calls.

Note: This type of buffer attribute can only be used with `WebGPURenderer` and a WebGPU backend.

## Constructor

### new IndirectStorageBufferAttribute( count : number | Uint32Array, itemSize : number )

Constructs a new storage buffer attribute.

**count**

The item count. It is also valid to pass a `Uint32Array` as an argument. The subsequent parameter is then obsolete.

**itemSize**

The item size.

## Properties

### .isIndirectStorageBufferAttribute : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/renderers/common/IndirectStorageBufferAttribute.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/IndirectStorageBufferAttribute.js)