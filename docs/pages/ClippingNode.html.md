*Inheritance: EventDispatcher → Node →*

# ClippingNode

This node is used in [NodeMaterial](NodeMaterial.html) to setup the clipping which can happen hardware-accelerated (if supported) and optionally use alpha-to-coverage for anti-aliasing clipped edges.

## Constructor

### new ClippingNode( scope : 'default' | 'hardware' | 'alphaToCoverage' )

Constructs a new clipping node.

**scope**

The node's scope. Similar to other nodes, the selected scope influences the behavior of the node and what type of code is generated.

Default is `'default'`.

## Properties

### .scope : 'default' | 'hardware' | 'alphaToCoverage'

The node's scope. Similar to other nodes, the selected scope influences the behavior of the node and what type of code is generated.

## Methods

### .setup( builder : NodeBuilder ) : Node

Setups the node depending on the selected scope.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The result node.

### .setupAlphaToCoverage( intersectionPlanes : Array.<Vector4>, unionPlanes : Array.<Vector4> ) : Node

Setups alpha to coverage.

**intersectionPlanes**

The intersection planes.

**unionPlanes**

The union planes.

**Returns:** The result node.

### .setupDefault( intersectionPlanes : Array.<Vector4>, unionPlanes : Array.<Vector4> ) : Node

Setups the default clipping.

**intersectionPlanes**

The intersection planes.

**unionPlanes**

The union planes.

**Returns:** The result node.

### .setupHardwareClipping( unionPlanes : Array.<Vector4>, builder : NodeBuilder ) : Node

Setups hardware clipping.

**unionPlanes**

The union planes.

**builder**

The current node builder.

**Returns:** The result node.

## Source

[src/nodes/accessors/ClippingNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/ClippingNode.js)