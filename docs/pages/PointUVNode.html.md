*Inheritance: EventDispatcher → Node →*

# PointUVNode

A node for representing the uv coordinates of points.

Can only be used with a WebGL backend. In WebGPU, point primitives always have the size of one pixel and can thus can't be used as sprite-like objects that display textures.

## Constructor

### new PointUVNode()

Constructs a new point uv node.

## Properties

### .isPointUVNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/nodes/accessors/PointUVNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/PointUVNode.js)