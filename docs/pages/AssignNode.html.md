*Inheritance: EventDispatcher → Node →*

# AssignNode

These node represents an assign operation. Meaning a node is assigned to another node.

## Constructor

### new AssignNode( targetNode : Node, sourceNode : Node )

Constructs a new assign node.

**targetNode**

The target node.

**sourceNode**

The source type.

## Properties

### .isAssignNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .sourceNode : Node

The source node.

### .targetNode : Node

The target node.

## Methods

### .isCacheable( builder : NodeBuilder ) : boolean

Assignments must not be cached in temporary variables.

**builder**

The current node builder.

**Overrides:** [Node#isCacheable](Node.html#isCacheable)

**Returns:** Always `false`.

### .needsSplitAssign( builder : NodeBuilder ) : boolean

Whether a split is required when assigning source to target. This can happen when the component length of target and source data type does not match.

**builder**

The current node builder.

**Returns:** Whether a split is required when assigning source to target.

## Source

[src/nodes/core/AssignNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/AssignNode.js)