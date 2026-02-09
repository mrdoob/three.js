*Inheritance: EventDispatcher → Node → TempNode →*

# GTAONode

Post processing node for applying Ground Truth Ambient Occlusion (GTAO) to a scene.

Reference: [Practical Real-Time Strategies for Accurate Indirect Occlusion](https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf).

## Code Example

```js
const postProcessing = new THREE.PostProcessing( renderer );
const scenePass = pass( scene, camera );
scenePass.setMRT( mrt( {
	output: output,
	normal: normalView
} ) );
const scenePassColor = scenePass.getTextureNode( 'output' );
const scenePassNormal = scenePass.getTextureNode( 'normal' );
const scenePassDepth = scenePass.getTextureNode( 'depth' );
const aoPass = ao( scenePassDepth, scenePassNormal, camera );
postProcessing.outputNod = aoPass.getTextureNode().mul( scenePassColor );
```

## Import

GTAONode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ao } from 'three/addons/tsl/display/GTAONode.js';
```

## Constructor

### new GTAONode( depthNode : Node.<float>, normalNode : Node.<vec3>, camera : Camera )

Constructs a new GTAO node.

**depthNode**

A node that represents the scene's depth.

**normalNode**

A node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

## Properties

### .depthNode : Node.<float>

A node that represents the scene's depth.

### .distanceExponent : UniformNode.<float>

Another option to tweak the occlusion. The recommended range is `[1,2]` for attenuating the AO.

### .distanceFallOff : UniformNode.<float>

The distance fall off value of the ambient occlusion. A lower value leads to a larger AO effect. The value should lie in the range `[0,1]`.

### .normalNode : Node.<vec3>

A node that represents the scene's normals. If no normals are passed to the constructor (because MRT is not available), normals can be automatically reconstructed from depth values in the shader.

### .radius : UniformNode.<float>

The radius of the ambient occlusion.

### .resolution : UniformNode.<vec2>

The resolution of the effect. Can be scaled via `resolutionScale`.

### .resolutionScale : number

The resolution scale. By default the effect is rendered in full resolution for best quality but a value of `0.5` should be sufficient for most scenes.

Default is `1`.

### .samples : UniformNode.<float>

How many samples are used to compute the AO. A higher value results in better quality but also in a more expensive runtime behavior.

### .scale : UniformNode.<float>

The scale of the ambient occlusion.

### .thickness : UniformNode.<float>

The thickness of the ambient occlusion.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .useTemporalFiltering : boolean

Whether to use temporal filtering or not. Setting this property to `true` requires the usage of `TRAANode`. This will help to reduce noise although it introduces typical TAA artifacts like ghosting and temporal instabilities.

If setting this property to `false`, a manual denoise via `DenoiseNode` might be required.

Default is `false`.

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

[examples/jsm/tsl/display/GTAONode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/GTAONode.js)