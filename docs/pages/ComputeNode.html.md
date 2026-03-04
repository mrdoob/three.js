*Inheritance: EventDispatcher → Node →*

# ComputeNode

TODO

## Constructor

### new ComputeNode( computeNode : Node, workgroupSize : Array.<number> )

Constructs a new compute node.

**computeNode**

TODO

**workgroupSize**

TODO.

## Properties

### .computeNode : Node

TODO

### .count : number | Array.<number>

TODO

### .isComputeNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name or label of the uniform.

Default is `''`.

**Overrides:** [Node#name](Node.html#name)

### .onInitFunction : function

TODO

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.OBJECT` since [ComputeNode#updateBefore](ComputeNode.html#updateBefore) is executed once per object by default.

Default is `'object'`.

**Overrides:** [Node#updateBeforeType](Node.html#updateBeforeType)

### .version : number

TODO

**Overrides:** [Node#version](Node.html#version)

### .workgroupSize : Array.<number>

TODO

Default is `[ 64 ]`.

## Methods

### .dispose()

Executes the `dispose` event for this node.

**Overrides:** [Node#dispose](Node.html#dispose)

### .getCount() : number | Array.<number>

TODO

### .label( name : string ) : ComputeNode

Sets the [ComputeNode#name](ComputeNode.html#name) property.

**name**

The name of the uniform.

**Deprecated:** Yes

**Returns:** A reference to this node.

### .onInit( callback : function ) : ComputeNode

TODO

**callback**

TODO.

**Returns:** A reference to this node.

### .setCount( count : number | Array.<number> ) : ComputeNode

TODO

**count**

Array with \[ x, y, z \] values for dispatch or a single number for the count

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