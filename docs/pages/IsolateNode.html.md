*Inheritance: EventDispatcher → Node →*

# IsolateNode

This node can be used as a cache management component for another node. Caching is in general used by default in [NodeBuilder](NodeBuilder.html) but this node allows the usage of a shared parent cache during the build process.

## Constructor

### new IsolateNode( node : Node, parent : boolean )

Constructs a new cache node.

**node**

The node that should be cached.

**parent**

Whether this node refers to a shared parent cache or not.

Default is `true`.

## Properties

### .isIsolateNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .node : Node

The node that should be cached.

### .parent : boolean

Whether this node refers to a shared parent cache or not.

Default is `true`.

## Source

[src/nodes/core/IsolateNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/IsolateNode.js)