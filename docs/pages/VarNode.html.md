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

### .assignable : boolean

Whether this node can be generated as an expression until it is assigned.

Default is `false`.

**Overrides:** [Node#assignable](Node.html#assignable)

### .global : boolean

`VarNode` sets this property to `true` by default.

Default is `true`.

**Overrides:** [Node#global](Node.html#global)

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

### .getAssignable() : boolean

Returns the assignable flag of this node.

**Returns:** The assignable flag.

### .setAssignable( value : boolean ) : VarNode

Sets the assignable flag for this node.

An assignable node is generated as an expression until it is assigned, at which point it is declared as a variable.

**value**

The value to set for the assignable flag.

**Returns:** This node.

## Source

[src/nodes/core/VarNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/VarNode.js)