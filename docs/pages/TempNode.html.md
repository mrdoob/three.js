*Inheritance: EventDispatcher → Node →*

# TempNode

This module uses cache management to create temporary variables if the node is used more than once to prevent duplicate calculations.

The class acts as a base class for many other nodes types.

## Constructor

### new TempNode( nodeType : string )

Constructs a temp node.

**nodeType**

The node type.

Default is `null`.

## Properties

### .isTempNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .hasDependencies( builder : NodeBuilder ) : boolean

Whether this node is used more than once in context of other nodes.

**builder**

The node builder.

**Returns:** A flag that indicates if there is more than one dependency to other nodes.

## Source

[src/nodes/core/TempNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/TempNode.js)