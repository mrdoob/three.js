*Inheritance: EventDispatcher → Node → TempNode →*

# RotateNode

Applies a rotation to the given position node.

## Constructor

### new RotateNode( positionNode : Node, rotationNode : Node, order : string )

Constructs a new rotate node.

**positionNode**

The position node.

**rotationNode**

Represents the rotation that is applied to the position node. Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.

**order**

The Euler rotation order. Only used for 3D rotation.

Default is `'XYZ'`.

## Properties

### .positionNode : Node

The position node.

### .rotationNode : Node

Represents the rotation that is applied to the position node. Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.

## Methods

### .customCacheKey() : number

Overwrites the default `customCacheKey()` implementation by including the Euler order into the cache key.

**Overrides:** [TempNode#customCacheKey](TempNode.html#customCacheKey)

**Returns:** The hash.

### .generateNodeType( builder : NodeBuilder ) : string

The type of the [RotateNode#positionNode](RotateNode.html#positionNode) defines the node's type.

**builder**

The current node builder.

**Overrides:** [TempNode#generateNodeType](TempNode.html#generateNodeType)

**Returns:** The node's type.

### .getOrder() : string

Gets the Euler rotation order.

**Returns:** The Euler rotation order.

### .setOrder( value : string ) : RotateNode

Sets the Euler rotation order.

**value**

The Euler rotation order.

**Returns:** A reference to this node.

## Source

[src/nodes/utils/RotateNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/RotateNode.js)