*Inheritance: EventDispatcher → Node →*

# PropertyNode

This class represents a shader property. It can be used to explicitly define a property and assign a value to it.

`PropertyNode` is used by the engine to predefined common material properties for TSL code.

## Code Example

```js
const threshold = property( 'float', 'threshold' ).assign( THRESHOLD );
```

## Constructor

### new PropertyNode( nodeType : string, name : string, varying : boolean, placeholderNode : Node )

Constructs a new property node.

**nodeType**

The type of the node.

**name**

The name of the property in the shader.

Default is `null`.

**varying**

Whether this property is a varying or not.

Default is `false`.

**placeholderNode**

The placeholder node if not assigned.

Default is `null`.

## Properties

### .global : boolean

This flag is used for global cache.

Default is `true`.

**Overrides:** [Node#global](Node.html#global)

### .isPropertyNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the property in the shader. If no name is defined, the node system auto-generates one.

Default is `null`.

**Overrides:** [Node#name](Node.html#name)

### .placeholderNode : Node

The placeholder node of the property if it is not assigned.

Default is `null`.

### .varying : boolean

Whether this property is a varying or not.

Default is `false`.

## Source

[src/nodes/core/PropertyNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/PropertyNode.js)