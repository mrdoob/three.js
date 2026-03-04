*Inheritance: EventDispatcher → Node → TempNode → PassNode →*

# SSAAPassNode

A special render pass node that renders the scene with SSAA (Supersampling Anti-Aliasing). This manual SSAA approach re-renders the scene ones for each sample with camera jitter and accumulates the results.

This node produces a high-quality anti-aliased output but is also extremely expensive because of its brute-force approach of re-rendering the entire scene multiple times.

Reference: [https://en.wikipedia.org/wiki/Supersampling](https://en.wikipedia.org/wiki/Supersampling)

## Import

SSAAPassNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ssaaPass } from 'three/addons/tsl/display/SSAAPassNode.js';
```

## Constructor

### new SSAAPassNode( scene : Scene, camera : Camera )

Constructs a new SSAA pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

## Properties

### .clearAlpha : number

The clear alpha of the pass.

Default is `0`.

### .clearColor : Color

The clear color of the pass.

Default is `0x000000`.

### .isSSAAPassNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .sampleLevel : number

The sample level specified as n, where the number of samples is 2^n, so sampleLevel = 4, is 2^4 samples, 16.

Default is `4`.

### .sampleWeight : UniformNode.<float>

A uniform node representing the sample weight.

Default is `1`.

### .unbiased : boolean

Whether rounding errors should be mitigated or not.

Default is `true`.

## Methods

### .dispose()

Frees internal resources. This method should be called when the pass is no longer required.

**Overrides:** [PassNode#dispose](PassNode.html#dispose)

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's MRT configuration and quad mesh.

**builder**

The current node builder.

**Overrides:** [PassNode#setup](PassNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to render the SSAA effect once per frame.

**frame**

The current node frame.

**Overrides:** [PassNode#updateBefore](PassNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/SSAAPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/SSAAPassNode.js)