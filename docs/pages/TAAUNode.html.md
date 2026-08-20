*Inheritance: EventDispatcher → Node → TempNode →*

# TAAUNode

A special node that performs Temporal Anti-Aliasing Upscaling (TAAU).

Like TRAA, the node accumulates jittered samples over multiple frames and reprojects history with motion vectors. Unlike TRAA, the input buffers (beauty, depth, velocity) are expected to be rendered at a lower resolution than the renderer's drawing buffer — typically by lowering the upstream pass's resolution via [PassNode#setResolutionScale](PassNode.html#setResolutionScale) — and the resolve pass reconstructs an output-resolution image using a 9-tap Blackman-Harris filter (Gaussian approximation) over the jittered input samples. The result is an alternative to FSR2/3 that does anti-aliasing and upscaling in a single pass.

References:

*   Karis, "High Quality Temporal Supersampling", SIGGRAPH 2014, [https://advances.realtimerendering.com/s2014/](https://advances.realtimerendering.com/s2014/)
*   Riley/Arcila, FidelityFX Super Resolution 2, GDC 2022, [https://gpuopen.com/download/GDC\_FidelityFX\_Super\_Resolution\_2\_0.pdf](https://gpuopen.com/download/GDC_FidelityFX_Super_Resolution_2_0.pdf)

Note: MSAA must be disabled when TAAU is in use.

## Import

TAAUNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { taau } from 'three/addons/tsl/display/TAAUNode.js';
```

## Constructor

### new TAAUNode( beautyNode : TextureNode, depthNode : TextureNode, velocityNode : TextureNode, camera : Camera )

Constructs a new TAAU node.

**beautyNode**

The texture node that represents the input of the effect.

**depthNode**

A node that represents the scene's depth.

**velocityNode**

A node that represents the scene's velocity.

**camera**

The camera the scene is rendered with.

## Properties

### .beautyNode : TextureNode

The texture node that represents the input of the effect.

### .camera : Camera

The camera the scene is rendered with.

### .currentFrameWeight : number

Baseline weight applied to the current frame in the resolve. Lower values produce smoother results with longer accumulation but slower convergence on disoccluded regions; the motion factor is added on top, so fast-moving pixels still respond quickly.

Default is `0.025`.

### .depthNode : TextureNode

A node that represents the scene's depth.

### .depthThreshold : number

When the difference between the current and previous depth goes above this threshold, the history is considered invalid.

Default is `0.0005`.

### .edgeDepthDiff : number

The depth difference within the 3×3 neighborhood to consider a pixel as an edge.

Default is `0.001`.

### .isTAAUNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .maxVelocityLength : number

The history becomes invalid as the pixel length of the velocity approaches this value.

Default is `128`.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .velocityNode : TextureNode

A node that represents the scene's velocity.

## Methods

### .clearViewOffset()

Clears the view offset from the scene's camera.

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getTextureNode() : PassTextureNode

Returns the result of the effect as a texture node.

**Returns:** A texture node that represents the result of the effect.

### .setSize( outputWidth : number, outputHeight : number )

Sets the output size of the effect (history and resolve targets). The previous-depth texture is sized independently in `updateBefore()` to track the scene's current depth texture.

**outputWidth**

The output width (drawing buffer width).

**outputHeight**

The output height (drawing buffer height).

### .setViewOffset( inputWidth : number, inputHeight : number )

Defines the TAAU's current jitter as a view offset to the scene's camera. The jitter is shrunk to one _output_ pixel (rather than one input pixel) so that the halton sequence gradually fills the output sub-pixel grid over multiple frames.

**inputWidth**

The width of the input buffers the camera renders into.

**inputHeight**

The height of the input buffers the camera renders into.

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's render targets and TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to render the effect once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/TAAUNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/TAAUNode.js)