*Inheritance: EventDispatcher → Node → AttributeNode →*

# VertexColorNode

An attribute node for representing vertex colors.

## Constructor

### new VertexColorNode( index : number )

Constructs a new vertex color node.

**index**

The attribute index.

## Properties

### .index : number

The attribute index to enable more than one sets of vertex colors.

Default is `0`.

### .isVertexColorNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .getAttributeName( builder : NodeBuilder ) : string

Overwrites the default implementation by honoring the attribute index.

**builder**

The current node builder.

**Overrides:** [AttributeNode#getAttributeName](AttributeNode.html#getAttributeName)

**Returns:** The attribute name.

## Source

[src/nodes/accessors/VertexColorNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/VertexColorNode.js)