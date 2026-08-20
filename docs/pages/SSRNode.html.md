*Inheritance: EventDispatcher → Node → TempNode →*

# SSRNode

Post processing node for computing screen space reflections (SSR).

Reference: [https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html](https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html)

## Import

SSRNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ssr } from 'three/addons/tsl/display/SSRNode.js';
```

## Constructor

### new SSRNode( colorNode : Node.<vec4>, depthNode : Node.<float>, normalNode : Node.<vec3>, options : SSRNodeOptions )

Constructs a new SSR node.

**colorNode**

The node that represents the beauty pass.

**depthNode**

A node that represents the beauty pass's depth.

**normalNode**

A node that represents the beauty pass's normals.

**options**

Optional inputs for material and environment data.

## Properties

### ._binaryRefine : boolean

Enables sub-step binary-search refinement of a detected hit. When on, a coarse crossing is bisected toward the exact intersection (sharper hits, less step aliasing) at the cost of extra depth samples. Baked into the shader as a compile-time constant; assigning a new value rebuilds the SSR material.

Default is `false`.

### ._blurQuality : number

The quality of the blur. Must be an integer in the range `[1,3]`.

Baked into the blur shader as a compile-time constant so the `(size*2+1)²` sample loop unrolls; assigning a new value recompiles the blur material.

Default is `2`.

### ._reflectNonMetals : boolean

Only used when [SSRNode#stochastic](SSRNode.html#stochastic) is `false`. When `false`, non-metallic surfaces are discarded for a noticeable performance gain; set `true` to also reflect dielectrics. Baked into the shader as a compile-time constant; assigning a new value recompiles the SSR material.

Default is `false`.

### ._screenEdgeFadeBlack : boolean

When `true`, SSR fades to zero near screen borders instead of blending toward the environment map. Hits are faded by the reflection sample UV; misses are faded by the surface pixel UV.

Baked into the shader as a compile-time constant so the unused fade branch is eliminated; assigning a new value recompiles the SSR material.

Default is `false`.

### ._stepExponent : number

Non-linear step distribution exponent. `1` = uniform steps; `> 1` concentrates samples near the ray origin — where most short-range reflections are missed — and spaces them out toward maxDistance, as `s = (i / steps) ^ stepExponent`.

Baked into the shader as a compile-time constant so `pow()` folds to a few multiplies; assigning a new value recompiles the SSR material. Only used by the stochastic reflection path.

Default is `2`.

### .binaryRefine : boolean

Whether sub-step binary-search hit refinement is enabled (compile-time constant). Assigning a new value rebuilds the SSR material.

### .blurQuality : number

Blur kernel size (compile-time constant). Assigning a new value recompiles the blur material.

### .camera : Camera

The camera the scene is rendered with.

### .colorNode : Node.<vec4>

The node that represents the beauty pass.

### .depthNode : Node.<float>

A node that represents the beauty pass's depth.

### .diffuseNode : Node.<vec4>

A node that represents the scene's diffuse color (typically the MRT `diffuseColor` attachment). When `null`, the shader uses `vec3(1)`.

### .envImportanceSampling : boolean

When `true`, env-luminance CDF tables are built and MIS is used for environment misses. Fixed at construction time.

### .envMapIntensity : UniformNode.<float>

Intensity multiplier for the importance-sampled env contribution. Only available after setEnvMap has been called.

### .environmentIntensity : UniformNode.<float>

Intensity multiplier applied to environment-map reflections on screen-space misses and at screen edges. Defaults to π to match the former hardcoded multiplier.

Default is `Math.PI`.

### .environmentNode : Texture

HDR environment map for screen-space misses.

### .historyTexture : Texture

A node that represents the history texture for multi-bounce reflections.

### .intensity : UniformNode.<float>

A multiplier for the overall reflection intensity. `1` leaves the reflections unchanged, lower values dim them and higher values boost them.

Default is `1`.

### .maxDistance : UniformNode.<float>

Controls how far a fragment can reflect. Increasing this value result in more computational overhead but also increases the reflection distance.

### .maxLuminance : UniformNode.<float>

Absolute env luminance cap. HDR env samples above this are scaled down (hue preserved).

Default is `10`.

### .metalnessNode : Node.<float>

Per-pixel metalness, used to drive the GGX reflection sampling and the non-metal early-out. When `null`, the shader treats surfaces as non-metallic.

### .mirrorBias : UniformNode.<float>

Mirror bias for the stochastic GGX sampling. Concentrates the reflected rays toward the lobe's narrow (near-mirror) core, trading a small amount of bias for less noise. `0` samples the full VNDF lobe; values toward `1` tighten the cone. Range `[0,1]`.

Default is `0.5`.

### .normalNode : Node.<vec3>

A node that represents the beauty pass's normals.

### .quality : UniformNode.<float>

This parameter controls how detailed the raymarching process works. The value ranges is `[0,1]` where `1` means best quality (the maximum number of raymarching iterations/samples) and `0` means no samples at all.

A quality of `0.5` is usually sufficient for most use cases. Try to keep this parameter as low as possible. Larger values result in noticeable more overhead.

### .reflectNonMetals : boolean

Whether dielectrics are reflected in the non-stochastic path (compile-time constant). Assigning a new value rebuilds the SSR material.

### .resolutionScale : number

The resolution scale. Valid values are in the range `[0,1]`. `1` means best quality but also results in more computational overhead. Setting to `0.5` means the effect is computed in half-resolution.

Default is `1`.

### .roughnessNode : Node.<float>

Per-pixel roughness, used to drive the GGX reflection sampling and the blur mip selection. When `null`, the shader treats surfaces as fully smooth.

### .screenEdgeFade : UniformNode.<float>

Screen-edge fade width, in UV units. As a screen-space hit approaches a screen border, the reflection is faded over this distance — either toward the environment reflection ([SSRNode#screenEdgeFadeBlack](SSRNode.html#screenEdgeFadeBlack) `false`) or to zero intensity (`true`). `0` disables it.

Default is `0.2`.

### .screenEdgeFadeBlack : boolean

Whether SSR fades to black near screen borders (compile-time constant). Assigning a new value recompiles the SSR material.

### .stepExponent : number

Non-linear step distribution exponent (compile-time constant). See the backing field for details. Assigning a new value recompiles the SSR material.

### .stochastic : boolean

When `true`, the reflection direction is varied per pixel with stochastic GGX rays (second-generation SSR). When `false`, a single mirror reflection is traced and roughness is softened with a blur pass (first-generation SSR).

### .thickness : UniformNode.<float>

Controls the cutoff between what counts as a possible reflection hit and what does not.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders its effect once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

### .velocityTexture : Node.<vec2>

A node that represents the velocity texture for reprojection.

## Methods

### .dispose()

Frees internal resources. This method should be called when the effect is no longer required.

**Overrides:** [TempNode#dispose](TempNode.html#dispose)

### .getTextureNode() : PassTextureNode

Returns the result of the effect as a texture node.

**Returns:** A texture node that represents the result of the effect.

### .setEnvMap( hdr : Texture | null )

Sets the environment map for importance-sampled env lighting when screen-space rays miss. Call this whenever the scene's env map changes.

Uses [ImportanceSampledEnvironment](ImportanceSampledEnvironment.html) (CDF + MIS adapted from [three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)).

**hdr**

The equirectangular HDR environment map, or null to disable.

See:

*   [https://github.com/gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)

### .setHistory( history : Texture, velocity : Node.<vec2> )

Wires the feedback inputs for multi-bounce reflections: the previous frame's denoised result (`history`) and the velocity buffer used to reproject it (`velocity`). `history` accepts the producing node (e.g. a [RecurrentDenoiseNode](RecurrentDenoiseNode.html)) — its output render target is used — or a raw texture. Pass `null` for both to disable multi-bounce.

**history**

**velocity**

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

[examples/jsm/tsl/display/SSRNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SSRNode.js)