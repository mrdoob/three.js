*Inheritance: EventDispatcher → Node →*

# ComputeNode

Represents a compute shader node.

## Constructor

### new ComputeNode( computeNode : Node, workgroupSize : Array.<number> )

Constructs a new compute node.

**computeNode**

The node that defines the compute shader logic.

**workgroupSize**

An array defining the X, Y, and Z dimensions of the workgroup for compute shader execution.

## Properties

### .computeNode : Node

The node that defines the compute shader logic.

### .count : number | Array.<number>

The total number of threads (invocations) to execute. If it is a number, it will be used to automatically generate bounds checking against `instanceIndex`.

### .countNode : UniformNode

A uniform node holding the dispatch count for bounds checking. Created automatically when `count` is a number.

### .dispatchSize : number | Array.<number>

The dispatch size for workgroups on X, Y, and Z axes. Used directly if `count` is not provided.

### .isComputeNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name or label of the uniform.

Default is `''`.

**Overrides:** [Node#name](Node.html#name)

### .onInitFunction : function

A callback executed when the compute node finishes initialization.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node computes once per frame.

Default is `'frame'`.

**Overrides:** [Node#updateBeforeType](Node.html#updateBeforeType)

### .version : number

The version of the node.

**Overrides:** [Node#version](Node.html#version)

### .workgroupSize : Array.<number>

An array defining the X, Y, and Z dimensions of the workgroup for compute shader execution.

Default is `[ 64 ]`.

## Methods

### .getUpdateBeforeType( frame : NodeFrame ) : NodeUpdateType

Returns the update type of [Node#updateBefore](Node.html#updateBefore).

**frame**

The current node frame.

**Overrides:** [Node#getUpdateBeforeType](Node.html#getUpdateBeforeType)

**Returns:** The update type.

### .label( name : string ) : ComputeNode

Sets the [ComputeNode#name](ComputeNode.html#name) property.

**name**

The name of the uniform.

**Deprecated:** Yes

**Returns:** A reference to this node.

### .onInit( callback : function ) : ComputeNode

Sets the callback to run during initialization.

**callback**

The callback function.

**Returns:** A reference to this node.

### .setName( name : string ) : ComputeNode

Sets the [ComputeNode#name](ComputeNode.html#name) property.

**name**

The name of the uniform.

**Returns:** A reference to this node.

### .updateBefore( frame : NodeFrame )

The method execute the compute for this node.

**frame**

A reference to the current node frame.

**Overrides:** [Node#updateBefore](Node.html#updateBefore)

## Source

[src/nodes/gpgpu/ComputeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/gpgpu/ComputeNode.js)