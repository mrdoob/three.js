*Inheritance: EventDispatcher → Node →*

# IndexNode

This class represents shader indices of different types. The following predefined node objects cover frequent use cases:

*   `vertexIndex`: The index of a vertex within a mesh.
*   `instanceIndex`: The index of either a mesh instance or an invocation of a compute shader.
*   `drawIndex`: The index of a draw call.
*   `invocationLocalIndex`: The index of a compute invocation within the scope of a workgroup load.
*   `invocationSubgroupIndex`: The index of a compute invocation within the scope of a subgroup.
*   `subgroupIndex`: The index of a compute invocation's subgroup within its workgroup.

## Constructor

### new IndexNode( scope : 'vertex' | 'instance' | 'subgroup' | 'invocationLocal' | 'invocationGlobal' | 'invocationSubgroup' | 'draw' )

Constructs a new index node.

**scope**

The scope of the index node.

## Properties

### .isIndexNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .scope : string

The scope of the index node.

## Source

[src/nodes/core/IndexNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/IndexNode.js)