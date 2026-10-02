*Inheritance: EventDispatcher → Node → TempNode →*

# SSAONode

Post processing node for a fast, screen-space ambient occlusion (SSAO).

It point-samples a per-pixel rotated Vogel disk and estimates obscurance with a single depth tap per sample, trading the ground-truth accuracy of [GTAONode](GTAONode.html)'s horizon ray-marching for lower cost. A built-in separable, depth-aware blur denoises the result so it can be used without temporal accumulation.

## Code Example

```js
const scenePass = pass( scene, camera );
scenePass.setMRT( mrt( { output, normal: normalView } ) );
const scenePassColor = scenePass.getTextureNode( 'output' );
const scenePassDepth = scenePass.getTextureNode( 'depth' );
const scenePassNormal = scenePass.getTextureNode( 'normal' );
const aoPass = ssao( scenePassDepth, scenePassNormal, camera );
renderPipeline.outputNode = scenePassColor.mul( aoPass.r );
```

## Import

SSAONode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { ssao } from 'three/addons/tsl/display/SSAONode.js';
```

## Constructor

### new SSAONode( depthNode : Node.<float>, normalNode : Node.<vec3>, camera : Camera )

Constructs a new SSAO node.

**depthNode**

A node that represents the scene's depth.

**normalNode**

A node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

## Properties

### .bias : UniformNode.<float>

An angle bias that suppresses self-occlusion on near-flat surfaces.

### .blurEnabled : boolean

Whether the depth-aware blur that denoises the raw AO is applied or not.

Default is `true`.

### .blurSharpness : UniformNode.<float>

How strongly the blur rejects samples across depth discontinuities, relative to the AO radius. A higher value keeps edges crisper.

### .depthNode : Node.<float>

A node that represents the scene's depth.

### .intensity : UniformNode.<float>

The strength of the occlusion.

### .normalNode : Node.<vec3>

A node that represents the scene's normals.

### .radius : UniformNode.<float>

The world-space radius the occlusion is gathered within.

### .resolution : Vector2

The resolution of the effect. Set from the drawing buffer size and `resolutionScale`.

### .resolutionScale : number

The resolution scale. The effect renders at a fraction of the drawing buffer for extra speed; `0.5` is a good default for a low-frequency signal like AO.

Default is `0.5`.

### .samples : UniformNode.<float>

How many samples are used to estimate the occlusion. A higher value results in a smoother result at a higher runtime cost.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

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

[examples/jsm/tsl/display/SSAONode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SSAONode.js)