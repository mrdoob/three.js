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

### .blendModes : Object.<string, BlendMode>

A dictionary storing the blend modes for each output.

### .clearColors : Object.<string, Color4>

A dictionary storing the clear colors for each output.

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

### .getBlendMode( name : string ) : BlendMode

Returns the blend mode for the given output name.

**name**

The name of the output.

**Returns:** The blend mode.

### .getClearColor( name : string ) : Color4

Returns the clear color for the given output name.

**name**

The name of the output.

**Returns:** The clear color. Returns `null` if no clear color is defined which means the renderer's default clear policy is applied.

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

### .setBlendMode( name : string, blend : BlendMode ) : MRTNode

Sets the blend mode for the given output name.

**name**

The name of the output.

**blend**

The blending mode.

**Returns:** The current MRT node.

### .setClearColor( name : string, color : number | string | Color, alpha : number ) : MRTNode

Sets the clear color for the given output name.

**name**

The name of the output.

**color**

The clear color.

**alpha**

The clear alpha.

Default is `1`.

**Returns:** The current MRT node.

## Source

[src/nodes/core/MRTNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/MRTNode.js)