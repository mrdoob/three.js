*Inheritance: EventDispatcher → Node →*

# MemberNode

Base class for representing member access on an object-like node data structures.

## Constructor

### new MemberNode( structNode : Node, property : string )

Constructs a member node.

**structNode**

The struct node.

**property**

The property name.

## Properties

### .isMemberNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .property : Node

The property name.

### .structNode : Node

The struct node.

## Source

[src/nodes/utils/MemberNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/MemberNode.js)