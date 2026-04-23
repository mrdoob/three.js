*Inheritance: EventDispatcher → Node →*

# CodeNode

This class represents native code sections. It is the base class for modules like [FunctionNode](FunctionNode.html) which allows to implement functions with native shader languages.

## Constructor

### new CodeNode( code : string, includes : Array.<Node>, language : 'js' | 'wgsl' | 'glsl' )

Constructs a new code node.

**code**

The native code.

Default is `''`.

**includes**

An array of includes.

Default is `[]`.

**language**

The used language.

Default is `''`.

## Properties

### .code : string

The native code.

Default is `''`.

### .global : boolean

This flag is used for global cache.

Default is `true`.

**Overrides:** [Node#global](Node.html#global)

### .includes : Array.<Node>

An array of includes

Default is `[]`.

### .isCodeNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .language : 'js' | 'wgsl' | 'glsl'

The used language.

Default is `''`.

## Methods

### .getIncludes( builder : NodeBuilder ) : Array.<Node>

Returns the includes of this code node.

**builder**

The current node builder.

**Returns:** The includes.

### .setIncludes( includes : Array.<Node> ) : CodeNode

Sets the includes of this code node.

**includes**

The includes to set.

**Returns:** A reference to this node.

## Source

[src/nodes/code/CodeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/code/CodeNode.js)