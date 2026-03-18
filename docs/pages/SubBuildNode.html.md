*Inheritance: EventDispatcher → Node →*

# SubBuildNode

This node is used to build a sub-build in the node system.

## Constructor

### new SubBuildNode( node : Node, name : string, nodeType : string )

**node**

The node to be built in the sub-build.

**name**

The name of the sub-build.

**nodeType**

The type of the node, if known.

Default is `null`.

## Properties

### .isSubBuildNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the sub-build.

**Overrides:** [Node#name](Node.html#name)

### .node : Node

The node to be built in the sub-build.

## Source

[src/nodes/core/SubBuildNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/SubBuildNode.js)