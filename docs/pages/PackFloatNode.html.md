*Inheritance: EventDispatcher → Node → TempNode →*

# PackFloatNode

This node represents an operation that packs floating-point values of a vector into an unsigned 32-bit integer

## Constructor

### new PackFloatNode( encoding : 'snorm' | 'unorm' | 'float16', vectorNode : Node )

**encoding**

The numeric encoding that describes how the float values are mapped to the integer range.

**vectorNode**

The vector node to be packed

## Properties

### .encoding : string

The numeric encoding.

### .isPackFloatNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .vectorNode : Node

The vector to be packed.

## Source

[src/nodes/math/PackFloatNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/math/PackFloatNode.js)