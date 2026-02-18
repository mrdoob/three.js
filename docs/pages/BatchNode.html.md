*Inheritance: EventDispatcher → Node →*

# BatchNode

This node implements the vertex shader logic which is required when rendering 3D objects via batching. `BatchNode` must be used with instances of [BatchedMesh](BatchedMesh.html).

## Constructor

### new BatchNode( batchMesh : BatchedMesh )

Constructs a new batch node.

**batchMesh**

A reference to batched mesh.

## Properties

### .batchMesh : BatchedMesh

A reference to batched mesh.

### .batchingIdNode : IndexNode

The batching index node.

Default is `null`.

## Methods

### .setup( builder : NodeBuilder )

Setups the internal buffers and nodes and assigns the transformed vertex data to predefined node variables for accumulation. That follows the same patterns like with morph and skinning nodes.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

## Source

[src/nodes/accessors/BatchNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/BatchNode.js)