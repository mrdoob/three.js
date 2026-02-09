*Inheritance: EventDispatcher → Node → TempNode →*

# SetNode

This module is part of the TSL core and usually not used in app level code. `SetNode` represents a set operation which means it is used to implement any `setXYZW()`, `setRGBA()` and `setSTPQ()` method invocations on node objects. For example:

## Code Example

```js
materialLine.colorNode = color( 0, 0, 0 ).setR( float( 1 ) );
```

## Constructor

### new SetNode( sourceNode : Node, components : string, targetNode : Node )

Constructs a new set node.

**sourceNode**

The node that should be updated.

**components**

The components that should be updated.

**targetNode**

The value node.

## Properties

### .components : string

The components that should be updated.

### .sourceNode : Node

The node that should be updated.

### .targetNode : Node

The value node.

## Methods

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from [SetNode#sourceNode](SetNode.html#sourceNode).

**builder**

The current node builder.

**Overrides:** [TempNode#getNodeType](TempNode.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/utils/SetNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/SetNode.js)