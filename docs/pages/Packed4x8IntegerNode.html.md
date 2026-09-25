*Inheritance: EventDispatcher → Node → TempNode →*

# Packed4x8IntegerNode

Represents one of the built-in functions of WGSL's `packed_4x8_integer_dot_product` language extension. If the extension is not available, the node falls back to an emulation with plain integer bit operations.

## Constructor

### new Packed4x8IntegerNode( method : string, aNode : Node, bNode : Node )

Constructs a packed 4x8 integer function node.

**method**

The WGSL built-in function name.

**aNode**

The first argument.

**bNode**

The optional second argument.

Default is `null`.

## Properties

### .aNode : Node

The first argument.

### .bNode : Node

The optional second argument.

### .isPacked4x8IntegerNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .method : string

The WGSL built-in function name.

## Source

[src/nodes/math/Packed4x8IntegerNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/math/Packed4x8IntegerNode.js)