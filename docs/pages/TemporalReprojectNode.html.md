*Inheritance: EventDispatcher → Node → TempNode →*

# TemporalReprojectNode

Temporal reprojection pass for denoising screen-space effects (SSGI, SSR, etc.).

Both modes share geometrically-weighted 4-tap bilinear history sampling and YCoCg variance clipping. Surface velocity reprojection is always sampled first. Specular mode then blends in hit-point parallax history on top of that surface result. Diffuse mode applies velocity-field divergence to detect surface stretching.

Unlike jitter-based TAA/TAAU, this node does not apply camera sub-pixel jitter — it only reprojects and accumulates history using motion vectors.

References:

*   [https://alextardif.com/TAA.html](https://alextardif.com/TAA.html)
*   [https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/](https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/)

## Import

TemporalReprojectNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { temporalReproject } from 'three/addons/tsl/display/TemporalReprojectNode.js';
```

## Constructor

### new TemporalReprojectNode( beautyNode : TextureNode, depthNode : TextureNode, normalNode : TextureNode, velocityNode : TextureNode, camera : Camera, options : TemporalReprojectNodeOptions )

**beautyNode**

**depthNode**

**normalNode**

**velocityNode**

**camera**

**options**

## Properties

### .accumulate : boolean

When `true`, resolve output is copied into the internal history buffer each frame. When `false`, history is supplied externally via [TemporalReprojectNode#setHistoryTexture](TemporalReprojectNode.html#setHistoryTexture).

### .mode : TemporalReprojectMode

## Methods

### .setHistoryTexture( source : Object | Texture )

Supplies an external history source (e.g. a [RecurrentDenoiseNode](RecurrentDenoiseNode.html) or its texture). Only used when [TemporalReprojectNode#accumulate](TemporalReprojectNode.html#accumulate) is `false`.

**source**

## Source

[examples/jsm/tsl/display/TemporalReprojectNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/TemporalReprojectNode.js)