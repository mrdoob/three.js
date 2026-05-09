*Inheritance: EventDispatcher → Node →*

# ViewportDepthNode

This node offers a collection of features in context of the depth logic in the fragment shader. Depending on [ViewportDepthNode#scope](ViewportDepthNode.html#scope), it can be used to define a depth value for the current fragment or for depth evaluation purposes.

## Constructor

### new ViewportDepthNode( scope : 'depth' | 'depthBase' | 'linearDepth', valueNode : Node )

Constructs a new viewport depth node.

**scope**

The node's scope.

**valueNode**

The value node.

Default is `null`.

## Properties

### .isViewportDepthNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .scope : 'depth' | 'depthBase' | 'linearDepth'

The node behaves differently depending on which scope is selected.

*   `ViewportDepthNode.DEPTH_BASE`: Allows to define a value for the current fragment's depth.
*   `ViewportDepthNode.DEPTH`: Represents the depth value for the current fragment (`valueNode` is ignored).
*   `ViewportDepthNode.LINEAR_DEPTH`: Represents the linear (orthographic) depth value of the current fragment. If a `valueNode` is set, the scope can be used to convert perspective depth data to linear data.

### .valueNode : Node

Can be used to define a custom depth value. The property is ignored in the `ViewportDepthNode.DEPTH` scope.

Default is `null`.

## Source

[src/nodes/display/ViewportDepthNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/ViewportDepthNode.js)