*Inheritance: EventDispatcher → Node →*

# ArrayElementNode

Base class for representing element access on an array-like node data structures.

## Constructor

### new ArrayElementNode( node : Node, indexNode : Node )

Constructs an array element node.

**node**

The array-like node.

**indexNode**

The index node that defines the element access.

## Properties

### .indexNode : Node

The index node that defines the element access.

### .isArrayElementNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .node : Node

The array-like node.

## Methods

### .getMemberType( builder : NodeBuilder, name : string ) : string

This method is overwritten since the member type is inferred from the array-like node.

**builder**

The current node builder.

**name**

The member name.

**Overrides:** [Node#getMemberType](Node.html#getMemberType)

**Returns:** The member type.

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from the array-like node.

**builder**

The current node builder.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/utils/ArrayElementNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/ArrayElementNode.js)