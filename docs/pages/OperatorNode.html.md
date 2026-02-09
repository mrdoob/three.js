*Inheritance: EventDispatcher → Node → TempNode →*

# OperatorNode

This node represents basic mathematical and logical operations like addition, subtraction or comparisons (e.g. `equal()`).

## Constructor

### new OperatorNode( op : string, aNode : Node, bNode : Node, …params : Node )

Constructs a new operator node.

**op**

The operator.

**aNode**

The first input.

**bNode**

The second input.

**params**

Additional input parameters.

## Properties

### .aNode : Node

The first input.

### .bNode : Node

The second input.

### .isOperatorNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .op : string

The operator.

## Methods

### .getNodeType( builder : NodeBuilder, output : string ) : string

This method is overwritten since the node type is inferred from the operator and the input node types.

**builder**

The current node builder.

**output**

The output type.

Default is `null`.

**Overrides:** [TempNode#getNodeType](TempNode.html#getNodeType)

**Returns:** The node type.

### .getOperatorMethod( builder : NodeBuilder, output : string ) : string

Returns the operator method name.

**builder**

The current node builder.

**output**

The output type.

**Returns:** The operator method name.

## Source

[src/nodes/math/OperatorNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/math/OperatorNode.js)