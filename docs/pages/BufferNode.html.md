*Inheritance: EventDispatcher → Node → InputNode → UniformNode →*

# BufferNode

A special type of uniform node which represents array-like data as uniform buffers. The access usually happens via `element()` which returns an instance of [ArrayElementNode](ArrayElementNode.html). For example:

In general, it is recommended to use the more managed [UniformArrayNode](UniformArrayNode.html) since it handles more input types and automatically cares about buffer paddings.

## Code Example

```js
const bufferNode = buffer( array, 'mat4', count );
const matrixNode = bufferNode.element( index ); // access a matrix from the buffer
```

## Constructor

### new BufferNode( value : Array.<number>, bufferType : string, bufferCount : number )

Constructs a new buffer node.

**value**

Array-like buffer data.

**bufferType**

The data type of the buffer.

**bufferCount**

The count of buffer elements.

Default is `0`.

## Properties

### .bufferCount : number

The uniform node that holds the value of the reference node.

Default is `0`.

### .bufferType : string

The data type of the buffer.

### .isBufferNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .updateRanges : Array.<{start: number, count: number}>

An array of update ranges.

## Methods

### .addUpdateRange( start : number, count : number )

Adds a range of data in the data array to be updated on the GPU.

**start**

Position at which to start update.

**count**

The number of components to update.

### .clearUpdateRanges()

Clears the update ranges.

### .getElementType( builder : NodeBuilder ) : string

The data type of the buffer elements.

**builder**

The current node builder.

**Overrides:** [UniformNode#getElementType](UniformNode.html#getElementType)

**Returns:** The element type.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return a fixed value `'buffer'`.

**builder**

The current node builder.

**Overrides:** [UniformNode#getInputType](UniformNode.html#getInputType)

**Returns:** The input type.

## Source

[src/nodes/accessors/BufferNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/BufferNode.js)