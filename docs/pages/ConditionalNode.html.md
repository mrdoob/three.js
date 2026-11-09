*Inheritance: EventDispatcher → Node →*

# ConditionalNode

Represents a logical `if/else` statement. Can be used as an alternative to the `If()`/`Else()` syntax.

The `select()` method is called in a chaining fashion on a condition. The parameter nodes of `select()` determine the outcome of the entire statement.

```js
velocity = position.greaterThanEqual( limit ).select( velocity.negate(), velocity );
```

When the condition is itself a vector (e.g. the `bvec4` produced by `someVec4.greaterThanEqual( someOtherVec4 )`), `select()` resolves per-component - each output lane picks independently based on its own condition component, the same way WGSL's native `select()` and GLSL's `mix( x, y, bvecN )` do - rather than picking one branch for the whole vector. The condition and values are converted to the largest vector width, with the condition converted to boolean components. Scalar values are broadcast.

```js
// per-component: each channel picks independently
const clamped = value.greaterThan( vec3( 1.0 ) ).select( vec3( 1.0 ), value );
```

## Constructor

### new ConditionalNode( condNode : Node, ifNode : Node, elseNode : Node )

Constructs a new conditional node.

**condNode**

The node that defines the condition.

**ifNode**

The node that is evaluate when the condition ends up `true`.

**elseNode**

The node that is evaluate when the condition ends up `false`.

Default is `null`.

## Properties

### .condNode : Node

The node that defines the condition.

### .elseNode : Node

The node that is evaluate when the condition ends up `false`.

Default is `null`.

### .ifNode : Node

The node that is evaluate when the condition ends up `true`.

## Methods

### .generateNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from the if/else nodes.

**builder**

The current node builder.

**Overrides:** [Node#generateNodeType](Node.html#generateNodeType)

**Returns:** The node type.

## Source

[src/nodes/math/ConditionalNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/math/ConditionalNode.js)