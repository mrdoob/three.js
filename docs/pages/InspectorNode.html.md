*Inheritance: EventDispatcher → Node →*

# InspectorNode

InspectorNode is a wrapper node that allows inspection of node values during rendering. It can be used to debug or analyze node outputs in the rendering pipeline.

The inspector node is registered by the inspected node when it is built, see Node#\_setupInspector.

## Constructor

### new InspectorNode( node : Node, name : string, callback : function | null )

Creates an InspectorNode.

**node**

The node to inspect.

**name**

Optional name for the inspector node.

Default is `''`.

**callback**

Optional callback to modify the node presented by the inspector.

Default is `null`.

## Static Properties

### .type

Returns the type of the node.

## Methods

### .generateNodeType( builder : NodeBuilder ) : string

Returns the type of the wrapped node.

**builder**

The node builder.

**Overrides:** [Node#generateNodeType](Node.html#generateNodeType)

### .getName() : string

Returns the name of the inspector node.

### .update( frame : NodeFrame )

Updates the inspector node, allowing inspection of the wrapped node.

**frame**

A reference to the current node frame.

**Overrides:** [Node#update](Node.html#update)

## Source

[src/nodes/core/InspectorNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/InspectorNode.js)