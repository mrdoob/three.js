*Inheritance: BufferAttribute →*

# InstancedBufferAttribute

An instanced version of a buffer attribute.

## Constructor

### new InstancedBufferAttribute( array : TypedArray, itemSize : number, normalized : boolean, meshPerAttribute : number )

Constructs a new instanced buffer attribute.

**array**

The array holding the attribute data.

**itemSize**

The item size.

**normalized**

Whether the data are normalized or not.

Default is `false`.

**meshPerAttribute**

How often a value of this buffer attribute should be repeated.

Default is `1`.

## Properties

### .isInstancedBufferAttribute : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .meshPerAttribute : number

Defines how often a value of this buffer attribute should be repeated. A value of one means that each value of the instanced attribute is used for a single instance. A value of two means that each value is used for two consecutive instances (and so on).

Default is `1`.

## Source

[src/core/InstancedBufferAttribute.js](https://github.com/mrdoob/three.js/blob/master/src/core/InstancedBufferAttribute.js)