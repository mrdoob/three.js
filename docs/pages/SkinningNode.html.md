*Inheritance: EventDispatcher → Node →*

# SkinningNode

This node implements the vertex transformation shader logic which is required for skinning/skeletal animation.

## Constructor

### new SkinningNode( skinnedMesh : SkinnedMesh )

Constructs a new skinning node.

**skinnedMesh**

The skinned mesh.

## Properties

### .bindMatrixInverseNode : Node.<mat4>

The bind matrix inverse node.

### .bindMatrixNode : Node.<mat4>

The bind matrix node.

### .boneMatricesNode : Node

The bind matrices as a uniform buffer node.

### .positionNode : Node.<vec3>

The current vertex position in local space.

### .previousBoneMatricesNode : Node

The previous bind matrices as a uniform buffer node. Required for computing motion vectors.

Default is `null`.

### .skinIndexNode : AttributeNode

The skin index attribute.

### .skinWeightNode : AttributeNode

The skin weight attribute.

### .skinnedMesh : SkinnedMesh

The skinned mesh.

### .toPositionNode : Node.<vec3>

The result of vertex position in local space.

### .updateType : string

The update type overwritten since skinning nodes are updated per object.

**Overrides:** [Node#updateType](Node.html#updateType)

## Methods

### .generate( builder : NodeBuilder, output : string ) : string

Generates the code snippet of the skinning node.

**builder**

The current node builder.

**output**

The current output.

**Overrides:** [Node#generate](Node.html#generate)

**Returns:** The generated code snippet.

### .getPreviousSkinnedPosition( builder : NodeBuilder ) : Node.<vec3>

Computes the transformed/skinned vertex position of the previous frame.

**builder**

The current node builder.

**Returns:** The skinned position from the previous frame.

### .getSkinnedNormalAndTangent( boneMatrices : Node, normal : Node.<vec3>, tangent : Node.<vec3> ) : Object

Transforms the given vertex normal and tangent via skinning.

**boneMatrices**

The bone matrices

Default is `this.boneMatricesNode`.

**normal**

The vertex normal in local space.

Default is `normalLocal`.

**tangent**

The vertex tangent in local space.

Default is `tangentLocal`.

**Returns:** The transformed vertex normal and tangent.

### .getSkinnedPosition( boneMatrices : Node, position : Node.<vec3> ) : Node.<vec3>

Transforms the given vertex position via skinning.

**boneMatrices**

The bone matrices

Default is `this.boneMatricesNode`.

**position**

The vertex position in local space.

Default is `this.positionNode`.

**Returns:** The transformed vertex position.

### .setup( builder : NodeBuilder ) : Node.<vec3>

Setups the skinning node by assigning the transformed vertex data to predefined node variables.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The transformed vertex position.

### .update( frame : NodeFrame )

Updates the state of the skinned mesh by updating the skeleton once per frame.

**frame**

The current node frame.

**Overrides:** [Node#update](Node.html#update)

## Source

[src/nodes/accessors/SkinningNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/SkinningNode.js)