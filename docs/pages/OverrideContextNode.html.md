*Inheritance: EventDispatcher → Node → ContextNode →*

# OverrideContextNode

A specialized context node designed to override specific target nodes within a node sub-graph or flow. This allows replacing specific inputs (e.g., normal and position vectors) dynamically during compilation for a specific flow node, without having to reconstruct or duplicate the source nodes.

## Code Example

```js
// Method chaining example:
node.overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
// Context assignment example:
material.contextNode = overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
```

## Constructor

### new OverrideContextNode( overrideNodes : Map.<Node, function()>, flowNode : Node | null )

Constructs a new override context node.

**overrideNodes**

A map mapping target nodes to their respective override callback functions.

**flowNode**

The node whose context should be modified.

Default is `null`.

## Properties

### .isOverrideContextNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .type : string (readonly)

Returns the type of the node.

## Methods

### .getFlowContextData() : Object

Gathers the context data from all parent context nodes by traversing the hierarchy, merging the `overrideNodes` maps from all encountered `OverrideContextNode` instances.

**Overrides:** [ContextNode#getFlowContextData](ContextNode.html#getFlowContextData)

**Returns:** The gathered context data, containing the merged `overrideNodes` map.

## Source

[src/nodes/core/OverrideContextNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/OverrideContextNode.js)