*Inheritance: EventDispatcher → Node →*

# RangeNode

`RangeNode` generates random instanced attribute data in a defined range. An exemplary use case for this utility node is to generate random per-instance colors:

## Code Example

```js
const material = new MeshBasicNodeMaterial();
material.colorNode = range( new Color( 0x000000 ), new Color( 0xFFFFFF ) );
const mesh = new InstancedMesh( geometry, material, count );
```

## Constructor

### new RangeNode( minNode : Node.<any>, maxNode : Node.<any> )

Constructs a new range node.

**minNode**

A node defining the lower bound of the range.

Default is `float()`.

**maxNode**

A node defining the upper bound of the range.

Default is `float()`.

## Properties

### .maxNode : Node.<any>

A node defining the upper bound of the range.

Default is `float()`.

### .minNode : Node.<any>

A node defining the lower bound of the range.

Default is `float()`.

## Methods

### .getConstNode( node : Node ) : Node

Returns a constant node from the given node by traversing it.

**node**

The node to traverse.

**Returns:** The constant node, if found.

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from range definition.

**builder**

The current node builder.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

### .getVectorLength( builder : NodeBuilder ) : number

Returns the vector length which is computed based on the range definition.

**builder**

The current node builder.

**Returns:** The vector length.

## Source

[src/nodes/geometry/RangeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/geometry/RangeNode.js)