*Inheritance: EventDispatcher → Node → TempNode →*

# RecurrentDenoiseNode

Post processing node for denoising temporally-accumulated screen-space effects such as SSGI (ambient occlusion / indirect diffuse) and SSR (specular reflections).

The denoising kernel is selected at construction time via `mode`: `'diffuse'` (SSGI) or `'specular'` (SSR). The kernel uses a fixed 8-sample Vogel disk.

## Import

RecurrentDenoiseNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { recurrentDenoise } from 'three/addons/tsl/display/RecurrentDenoiseNode.js';
```

## Constructor

### new RecurrentDenoiseNode( inputTexture : TextureNode, camera : Camera, options : RecurrentDenoiseNodeOptions )

**inputTexture**

Temporally filtered input to denoise (e.g. TRAA output).

**camera**

**options**

Default is `{}`.

## Properties

### .accumulate : boolean

When `true`, apply temporal blending after spatial denoising. When `false`, output spatially filtered colour only (alpha is passed through from the input temporal pass).

### .alphaSource : DenoiseAlphaSource

Which channel of the raw texture drives alpha-based edge stopping. `'raylength'` — alpha encodes SSR ray length; `'ao'` — alpha encodes AO factor; `'none'` — skip alpha-based edge stopping.

Default is `'raylength'`.

### .mode : DenoiseMode

Denoising kernel type.

## Methods

### .getRenderTarget() : RenderTarget

Returns the internal output render target (e.g. for temporal reprojection/SSGI temporal feedback loops).

## Source

[examples/jsm/tsl/display/RecurrentDenoiseNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/RecurrentDenoiseNode.js)