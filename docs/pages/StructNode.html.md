*Inheritance: EventDispatcher → Node →*

# StructNode

StructNode allows to create custom structures with multiple members. This can also be used to define structures in attribute and uniform data.

## Code Example

```js
// Define a custom struct
const BoundingBox = struct( { min: 'vec3', max: 'vec3' } );
// Create a new instance of the struct
const bb = BoundingBox( vec3( 0 ), vec3( 1 ) ); // style 1
const bb = BoundingBox( { min: vec3( 0 ), max: vec3( 1 ) } ); // style 2
// Access the struct members
const min = bb.get( 'min' );
// Assign a new value to a member
min.assign( vec3() );
```

## Constructor

### new StructNode()

## Source

[src/nodes/core/StructNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/StructNode.js)