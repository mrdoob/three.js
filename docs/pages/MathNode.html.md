*Inheritance: EventDispatcher → Node → TempNode →*

# MathNode

This node represents a variety of mathematical methods available in shaders. They are divided into three categories:

*   Methods with one input like `sin`, `cos` or `normalize`.
*   Methods with two inputs like `dot`, `cross` or `pow`.
*   Methods with three inputs like `mix`, `clamp` or `smoothstep`.

## Constructor

### new MathNode( method : string, aNode : Node, bNode : Node, cNode : Node )

Constructs a new math node.

**method**

The method name.

**aNode**

The first input.

**bNode**

The second input.

Default is `null`.

**cNode**

The third input.

Default is `null`.

## Properties

### .aNode : Node

The first input.

### .bNode : Node

The second input.

Default is `null`.

### .cNode : Node

The third input.

Default is `null`.

### .isMathNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .method : string

The method name.

## Methods

### .getInputType( builder : NodeBuilder ) : string

The input type is inferred from the node types of the input nodes.

**builder**

The current node builder.

**Returns:** The input type.

### .getNodeType( builder : NodeBuilder ) : string

The selected method as well as the input type determine the node type of this node.

**builder**

The current node builder.

**Overrides:** [TempNode#getNodeType](TempNode.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/math/MathNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/math/MathNode.js)