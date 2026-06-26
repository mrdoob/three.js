*Inheritance: EventDispatcher → Node → TempNode →*

# UnpackFloatNode

This node represents an operation that unpacks values from a 32-bit unsigned integer, reinterpreting the results as a floating-point vector

## Constructor

### new UnpackFloatNode( encoding : 'snorm' | 'unorm' | 'float16', uintNode : Node )

**encoding**

The numeric encoding that describes how the integer values are mapped to the float range

**uintNode**

The uint node to be unpacked

## Properties

### .encoding : string

The numeric encoding.

### .isUnpackFloatNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .uintNode : Node

The unsigned integer to be unpacked.

## Source

[src/nodes/math/UnpackFloatNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/math/UnpackFloatNode.js)