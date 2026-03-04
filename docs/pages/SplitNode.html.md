*Inheritance: EventDispatcher → Node →*

# SplitNode

This module is part of the TSL core and usually not used in app level code. `SplitNode` represents a property access operation which means it is used to implement any `.xyzw`, `.rgba` and `stpq` usage on node objects. For example:

## Code Example

```js
const redValue = color.r;
```

## Constructor

### new SplitNode( node : Node, components : string )

Constructs a new split node.

**node**

The node that should be accessed.

**components**

The components that should be accessed.

Default is `'x'`.

## Properties

### .components : string

The components that should be accessed.

### .isSplitNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .node : Node

The node that should be accessed.

## Methods

### .getComponentType( builder : NodeBuilder ) : string

Returns the component type of the node's type.

**builder**

The current node builder.

**Returns:** The component type.

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from requested components.

**builder**

The current node builder.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

### .getScope() : Node

Returns the scope of the node.

**Overrides:** [Node#getScope](Node.html#getScope)

**Returns:** The scope of the node.

### .getVectorLength() : number

Returns the vector length which is computed based on the requested components.

**Returns:** The vector length.

## Source

[src/nodes/utils/SplitNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/SplitNode.js)