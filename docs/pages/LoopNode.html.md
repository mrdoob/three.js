*Inheritance: EventDispatcher → Node →*

# LoopNode

This module offers a variety of ways to implement loops in TSL. In it's basic form it's:

However, it is also possible to define a start and end ranges, data types and loop conditions:

```js
Loop( { start: int( 0 ), end: int( 10 ), type: 'int', condition: '<' }, ( { i } ) => {
} );
```

Nested loops can be defined in a compacted form:

```js
Loop( 10, 5, ( { i, j } ) => {
} );
```

Loops that should run backwards can be defined like so:

```js
Loop( { start: 10 }, () => {} );
```

It is possible to execute with boolean values, similar to the `while` syntax.

```js
const value = float( 0 ).toVar();
Loop( value.lessThan( 10 ), () => {
	value.addAssign( 1 );
} );
```

The module also provides `Break()` and `Continue()` TSL expression for loop control.

## Code Example

```js
Loop( count, ( { i } ) => {
} );
```

## Constructor

### new LoopNode( params : Array.<any> )

Constructs a new loop node.

**params**

Depending on the loop type, array holds different parameterization values for the loop.

## Methods

### .getProperties( builder : NodeBuilder ) : Object

Returns properties about this node.

**builder**

The current node builder.

**Returns:** The node properties.

### .getVarName( index : number ) : string

Returns a loop variable name based on an index. The pattern is `0` = `i`, `1`\= `j`, `2`\= `k` and so on.

**index**

The index.

**Returns:** The loop variable name.

## Source

[src/nodes/utils/LoopNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/LoopNode.js)