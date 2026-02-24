*Inheritance: EventDispatcher → Node → TempNode →*

# RotateNode

Applies a rotation to the given position node.

## Constructor

### new RotateNode( positionNode : Node, rotationNode : Node )

Constructs a new rotate node.

**positionNode**

The position node.

**rotationNode**

Represents the rotation that is applied to the position node. Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.

## Properties

### .positionNode : Node

The position node.

### .rotationNode : Node

Represents the rotation that is applied to the position node. Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.

## Methods

### .getNodeType( builder : NodeBuilder ) : string

The type of the [RotateNode#positionNode](RotateNode.html#positionNode) defines the node's type.

**builder**

The current node builder.

**Overrides:** [TempNode#getNodeType](TempNode.html#getNodeType)

**Returns:** The node's type.

## Source

[src/nodes/utils/RotateNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/RotateNode.js)