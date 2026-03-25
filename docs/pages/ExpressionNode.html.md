*Inheritance: EventDispatcher → Node →*

# ExpressionNode

This class can be used to implement basic expressions in shader code. Basic examples for that are `return`, `continue` or `discard` statements.

## Constructor

### new ExpressionNode( snippet : string, nodeType : string )

Constructs a new expression node.

**snippet**

The native code snippet.

Default is `''`.

**nodeType**

The node type.

Default is `'void'`.

## Properties

### .snippet : string

The native code snippet.

Default is `''`.

## Source

[src/nodes/code/ExpressionNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/code/ExpressionNode.js)