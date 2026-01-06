*Inheritance: EventDispatcher → Node → OutputStructNode →*

# MRTNode

This node can be used setup a MRT context for rendering. A typical MRT setup for post-processing is shown below:

The MRT output is defined as a dictionary.

## Code Example

```js
const mrtNode = mrt( {
  output: output,
  normal: normalView
} ) ;
```

## Constructor

### new MRTNode( outputNodes : Object.<string, Node> )

Constructs a new output struct node.

**outputNodes**

The MRT outputs.

## Properties

### .isMRTNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .outputNodes : Object.<string, Node>

A dictionary representing the MRT outputs. The key is the name of the output, the value the node which produces the output result.

## Methods

### .get( name : string ) : Node

Returns the output node for the given name.

**name**

The name of the output.

**Returns:** The output node.

### .has( name : string ) : NodeBuilder

Returns `true` if the MRT node has an output with the given name.

**name**

The name of the output.

**Returns:** Whether the MRT node has an output for the given name or not.

### .merge( mrtNode : MRTNode ) : MRTNode

Merges the outputs of the given MRT node with the outputs of this node.

**mrtNode**

The MRT to merge.

**Returns:** A new MRT node with merged outputs..

## Source

[src/nodes/core/MRTNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/MRTNode.js)