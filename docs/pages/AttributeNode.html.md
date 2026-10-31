*Inheritance: EventDispatcher → Node →*

# AttributeNode

Base class for representing shader attributes as nodes.

## Constructor

### new AttributeNode( attributeName : string, nodeType : string )

Constructs a new attribute node.

**attributeName**

The name of the attribute.

**nodeType**

The node type.

Default is `null`.

## Properties

### .global : boolean

`AttributeNode` sets this property to `true` by default.

Default is `true`.

**Overrides:** [Node#global](Node.html#global)

## Methods

### .getAttributeName( builder : NodeBuilder ) : string

Returns the attribute name of this node. The method can be overwritten in derived classes if the final name must be computed analytically.

**builder**

The current node builder.

**Returns:** The attribute name.

### .getContextAttribute( builder : NodeBuilder ) : Node

Returns the node which provides the value of this attribute in the current context, if any. The context can provide attributes with a `getAttribute( name, builder )` function, e.g. if the vertices are pulled from a storage buffer or the surface is reconstructed per fragment. The function should return the same node for the same attribute.

**builder**

The current node builder.

**Returns:** The node providing the value of the attribute.

### .getShared( builder : NodeBuilder ) : Node

An attribute provided by the context is replaced by the provided node, like an override.

**builder**

The current node builder.

**Overrides:** [Node#getShared](Node.html#getShared)

**Returns:** The shared node if possible. Otherwise `this` is returned.

### .setAttributeName( attributeName : string ) : AttributeNode

Sets the attribute name to the given value. The method can be overwritten in derived classes if the final name must be computed analytically.

**attributeName**

The name of the attribute.

**Returns:** A reference to this node.

## Source

[src/nodes/core/AttributeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/AttributeNode.js)