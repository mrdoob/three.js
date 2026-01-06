*Inheritance: EventDispatcher → Node → ArrayElementNode →*

# ReferenceElementNode

This class is only relevant if the referenced property is array-like. In this case, `ReferenceElementNode` allows to refer to a specific element inside the data structure via an index.

## Constructor

### new ReferenceElementNode( referenceNode : ReferenceBaseNode, indexNode : Node )

Constructs a new reference element node.

**referenceNode**

The reference node.

**indexNode**

The index node that defines the element access.

## Properties

### .isReferenceElementNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .isReferenceElementNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .referenceNode : ReferenceBaseNode

Similar to [ReferenceBaseNode#reference](ReferenceBaseNode.html#reference), an additional property references to the current node.

Default is `null`.

### .referenceNode : ReferenceNode

Similar to [ReferenceNode#reference](ReferenceNode.html#reference), an additional property references to the current node.

Default is `null`.

## Methods

### .getNodeType() : string

This method is overwritten since the node type is inferred from the uniform type of the reference node.

**Overrides:** [ArrayElementNode#getNodeType](ArrayElementNode.html#getNodeType)

**Returns:** The node type.

### .getNodeType() : string

This method is overwritten since the node type is inferred from the uniform type of the reference node.

**Overrides:** [ArrayElementNode#getNodeType](ArrayElementNode.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/accessors/ReferenceBaseNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/ReferenceBaseNode.js)

This class is only relevant if the referenced property is array-like. In this case, `ReferenceElementNode` allows to refer to a specific element inside the data structure via an index.

## Constructor

### new ReferenceElementNode( referenceNode : ReferenceNode, indexNode : Node )

Constructs a new reference element node.

**referenceNode**

The reference node.

**indexNode**

The index node that defines the element access.

## Properties

### .isReferenceElementNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .isReferenceElementNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .referenceNode : ReferenceBaseNode

Similar to [ReferenceBaseNode#reference](ReferenceBaseNode.html#reference), an additional property references to the current node.

Default is `null`.

### .referenceNode : ReferenceNode

Similar to [ReferenceNode#reference](ReferenceNode.html#reference), an additional property references to the current node.

Default is `null`.

## Methods

### .getNodeType() : string

This method is overwritten since the node type is inferred from the uniform type of the reference node.

**Overrides:** [ArrayElementNode#getNodeType](ArrayElementNode.html#getNodeType)

**Returns:** The node type.

### .getNodeType() : string

This method is overwritten since the node type is inferred from the uniform type of the reference node.

**Overrides:** [ArrayElementNode#getNodeType](ArrayElementNode.html#getNodeType)

**Returns:** The node type.

## Source

[src/nodes/accessors/ReferenceNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/ReferenceNode.js)