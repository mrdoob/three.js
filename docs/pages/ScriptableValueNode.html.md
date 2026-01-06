*Inheritance: EventDispatcher → Node →*

# ScriptableValueNode

`ScriptableNode` uses this class to manage script inputs and outputs.

## Constructor

### new ScriptableValueNode( value : any )

Constructs a new scriptable node.

**value**

The value.

Default is `null`.

## Properties

### .events : EventDispatcher

An event dispatcher for managing events.

### .inputType : string

If this node represents an input, this property represents the input type.

Default is `null`.

### .isScriptableOutputNode : boolean (readonly)

Whether this node represents an output or not.

Default is `true`.

### .isScriptableValueNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .outputType : string

If this node represents an output, this property represents the output type.

Default is `null`.

### .value : any

The node's value.

## Methods

### .getNodeType( builder : NodeBuilder ) : string

Overwritten since the node type is inferred from the value.

**builder**

The current node builder.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

### .getValue() : any

The `value` property usually represents a node or even binary data in form of array buffers. In this case, this method tries to return the actual value behind the complex type.

**Returns:** The value.

### .refresh()

Dispatches the `refresh` event.

## Source

[src/nodes/code/ScriptableValueNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/code/ScriptableValueNode.js)