*Inheritance: EventDispatcher → Node →*

# ConvertNode

This module is part of the TSL core and usually not used in app level code. It represents a convert operation during the shader generation process meaning it converts the data type of a node to a target data type.

## Constructor

### new ConvertNode( node : Node, convertTo : string )

Constructs a new convert node.

**node**

The node which type should be converted.

**convertTo**

The target node type. Multiple types can be defined by separating them with a `|` sign.

## Properties

### .convertTo : string

The target node type. Multiple types can be defined by separating them with a `|` sign.

### .node : Node

The node which type should be converted.

## Methods

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the implementation tries to infer the best matching type from the [ConvertNode#convertTo](ConvertNode.html#convertTo) property.

**builder**

The current node builder.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/utils/ConvertNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/ConvertNode.js)