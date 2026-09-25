*Inheritance: EventDispatcher → Node →*

# LoopNode

This module offers a variety of ways to implement loops in TSL. In it's basic form it's:

```js
Loop( count, ( { i } ) => {
} );
```

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

The module also provides `Break()` and `Continue()` TSL expressions for loop control.

## Constructor

### new LoopNode( params : Array.<(LoopNode~Params|loopBodyCallback)> )

Constructs a new loop node.

**params**

Any number of loop parameters followed by the loop body.

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

## Type Definitions

### .ObjectParams

A detailed loop configuration.

**start**  
number | [Node](Node.html).<int> | [Node](Node.html).<uint>

The initial value of the loop variable.

Default is `0`.

**end**  
number | [Node](Node.html).<int> | [Node](Node.html).<uint>

The value the loop variable is compared against. If omitted, the loop counts down from `start - 1` to `0`.

**name**  
string

The name of the loop variable. Defaults to `i`, `j`, `k` and so on.

**type**  
string

The data type of the loop variable.

Default is `'int'`.

**condition**  
'<' | '<=' | '>' | '>='

The comparison operator. The loop runs as long as the comparison is true. Inferred from `start` and `end` if not set.

**update**  
string | number | function | [Node](Node.html)

Defines how the loop variable is updated after each iteration. Inferred from `condition` and `type` if not set.

### .Params

The parameters of a loop. A number or int/uint node defines the loop's end value, a bool node defines a `while` loop and an object allows a more detailed configuration.

## Source

[src/nodes/utils/LoopNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/LoopNode.js)