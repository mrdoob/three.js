*Inheritance: EventDispatcher → Node → ArrayElementNode →*

# WorkgroupInfoElementNode

Represents an element of a 'workgroup' scoped buffer.

## Constructor

### new WorkgroupInfoElementNode( workgroupInfoNode : Node, indexNode : Node )

Constructs a new workgroup info element node.

**workgroupInfoNode**

The workgroup info node.

**indexNode**

The index node that defines the element access.

## Properties

### .isWorkgroupInfoElementNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/nodes/gpgpu/WorkgroupInfoNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/gpgpu/WorkgroupInfoNode.js)