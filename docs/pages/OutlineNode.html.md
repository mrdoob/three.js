*Inheritance: EventDispatcher → Node → TempNode →*

# OutlineNode

Post processing node for rendering outlines around selected objects. The node gives you great flexibility in composing the final outline look depending on your requirements.

## Code Example

```js
const postProcessing = new THREE.PostProcessing( renderer );
const scenePass = pass( scene, camera );
// outline parameter
const edgeStrength = uniform( 3.0 );
const edgeGlow = uniform( 0.0 );
const edgeThickness = uniform( 1.0 );
const visibleEdgeColor = uniform( new THREE.Color( 0xffffff ) );
const hiddenEdgeColor = uniform( new THREE.Color( 0x4e3636 ) );
outlinePass = outline( scene, camera, {
	selectedObjects,
	edgeGlow,
	edgeThickness
} );
// compose custom outline
const { visibleEdge, hiddenEdge } = outlinePass;
const outlineColor = visibleEdge.mul( visibleEdgeColor ).add( hiddenEdge.mul( hiddenEdgeColor ) ).mul( edgeStrength );
postProcessing.outputNode = outlineColor.add( scenePass );
```

## Import

OutlineNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { outline } from 'three/addons/tsl/display/OutlineNode.js';
```

## Constructor

### new OutlineNode( scene : Scene, camera : Camera, params : Object )

Constructs a new outline node.

**scene**

A reference to the scene.

**camera**

The camera the scene is rendered with.

**params**

The configuration parameters.

**selectedObjects**

An array of selected objects.

**edgeThickness**

The thickness of the edges.

Default is `float(1)`.

**edgeGlow**

Can be used for an animated glow/pulse effects.

Default is `float(0)`.

**downSampleRatio**

The downsample ratio.

Default is `2`.

## Properties

### .camera : Camera

The camera the scene is rendered with.

### .downSampleRatio : number

The downsample ratio.

Default is `2`.

### .edgeGlowNode : Node.<float>

Can be used for an animated glow/pulse effect.

### .edgeThicknessNode : Node.<float>

The thickness of the edges.

### .hiddenEdge

A mask value that represents the hidden edge.

### .scene : Scene

A reference to the scene.

### .selectedObjects : Array.<Object3D>

An array of selected objects.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .visibleEdge

A mask value that represents the visible edge.

## Methods

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getTextureNode() : PassTextureNode

Returns the result of the effect as a texture node.

**Returns:** A texture node that represents the result of the effect.

### .setSize( width : number, height : number )

Sets the size of the effect.

**width**

The width of the effect.

**height**

The height of the effect.

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to render the effect once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/OutlineNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/OutlineNode.js)