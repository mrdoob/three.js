*Inheritance: EventDispatcher → Node →*

# OutputStructNode

This node can be used to define multiple outputs in a shader programs.

## Constructor

### new OutputStructNode( …members : Node )

Constructs a new output struct node. The constructor can be invoked with an arbitrary number of nodes representing the members.

**members**

A parameter list of nodes.

## Properties

### .isOutputStructNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .members : Array.<Node>

An array of nodes which defines the output.

## Source

[src/nodes/core/OutputStructNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/OutputStructNode.js)