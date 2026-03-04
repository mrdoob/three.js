*Inheritance: EventDispatcher → Node → TempNode →*

# FlipNode

This module is part of the TSL core and usually not used in app level code. It represents a flip operation during the shader generation process meaning it flips normalized values with the following formula:

`FlipNode` is internally used to implement any `flipXYZW()`, `flipRGBA()` and `flipSTPQ()` method invocations on node objects. For example:

```js
uvNode = uvNode.flipY();
```

## Code Example

```js
x = 1 - x;
```

## Constructor

### new FlipNode( sourceNode : Node, components : string )

Constructs a new flip node.

**sourceNode**

The node which component(s) should be flipped.

**components**

The components that should be flipped e.g. `'x'` or `'xy'`.

## Properties

### .components : string

The components that should be flipped e.g. `'x'` or `'xy'`.

### .sourceNode : Node

The node which component(s) should be flipped.

## Methods

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from the source node.

**builder**

The current node builder.

**Overrides:** [TempNode#getNodeType](TempNode.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/utils/FlipNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/FlipNode.js)