*Inheritance: EventDispatcher → Node →*

# ScreenNode

This node provides a collection of screen related metrics. Depending on [ScreenNode#scope](ScreenNode.html#scope), the nodes can represent resolution or viewport data as well as fragment or uv coordinates.

## Constructor

### new ScreenNode( scope : 'coordinate' | 'viewport' | 'size' | 'uv' | 'dpr' )

Constructs a new screen node.

**scope**

The node's scope.

## Properties

### .isViewportNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .scope : 'coordinate' | 'viewport' | 'size' | 'uv' | 'dpr'

The node represents different metric depending on which scope is selected.

*   `ScreenNode.COORDINATE`: Window-relative coordinates of the current fragment according to WebGPU standards.
*   `ScreenNode.VIEWPORT`: The current viewport defined as a four-dimensional vector.
*   `ScreenNode.SIZE`: The dimensions of the current bound framebuffer.
*   `ScreenNode.UV`: Normalized coordinates.
*   `ScreenNode.DPR`: Device pixel ratio.

## Methods

### .getNodeType() : 'float' | 'vec2' | 'vec4'

This method is overwritten since the node type depends on the selected scope.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

### .getUpdateType() : NodeUpdateType

This method is overwritten since the node's update type depends on the selected scope.

**Overrides:** [Node#getUpdateType](Node.html#getUpdateType)

**Returns:** The update type.

### .update( frame : NodeFrame )

`ScreenNode` implements [Node#update](Node.html#update) to retrieve viewport and size information from the current renderer.

**frame**

A reference to the current node frame.

**Overrides:** [Node#update](Node.html#update)

## Source

[src/nodes/display/ScreenNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/ScreenNode.js)