*Inheritance: EventDispatcher → Node →*

# VarNode

Class for representing shader variables as nodes. Variables are created from existing nodes like the following:

## Code Example

```js
const depth = sampleDepth( uvNode ).toVar( 'depth' );
```

## Constructor

### new VarNode( node : Node, name : string, readOnly : boolean )

Constructs a new variable node.

**node**

The node for which a variable should be created.

**name**

The name of the variable in the shader.

Default is `null`.

**readOnly**

The read-only flag.

Default is `false`.

## Properties

### .global : boolean

`VarNode` sets this property to `true` by default.

Default is `true`.

**Overrides:** [Node#global](Node.html#global)

### .intent : boolean

This flag is used to indicate that this node is used for intent.

Default is `false`.

### .isVarNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the variable in the shader. If no name is defined, the node system auto-generates one.

Default is `null`.

**Overrides:** [Node#name](Node.html#name)

### .node : Node

The node for which a variable should be created.

### .parents : boolean

Add this flag to the node system to indicate that this node require parents.

Default is `true`.

**Overrides:** [Node#parents](Node.html#parents)

### .readOnly : boolean

The read-only flag.

Default is `false`.

## Methods

### .getIntent() : boolean

Returns the intent flag of this node.

**Returns:** The intent flag.

### .isIntent( builder : NodeBuilder ) : boolean

Checks if this node is used for intent.

**builder**

The node builder.

**Returns:** Whether this node is used for intent.

### .setIntent( value : boolean ) : VarNode

Sets the intent flag for this node.

This flag is used to indicate that this node is used for intent and should not be built directly. Instead, it is used to indicate that the node should be treated as a variable intent.

It's useful for assigning variables without needing creating a new variable node.

**value**

The value to set for the intent flag.

**Returns:** This node.

## Source

[src/nodes/core/VarNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/VarNode.js)