*Inheritance: EventDispatcher → Node → TempNode → PassNode →*

# OITPassNode

A render pass node that renders the scene with Order-Independent Transparency based on the Weighted Blended OIT technique by McGuire and Bavoil.

Transparent objects are rendered in a separate pass into two accumulation targets (a weighted color sum and the pixel's revealage) which are then composited over the rest of the scene. Since the result does not depend on the draw order, artifacts from sorting-based transparency like popping or incorrectly resolved intersecting geometry are avoided.

Only transparent materials using `NormalBlending` and no transmission qualify for OIT. All other objects are rendered as usual.

MSAA is only supported with the WebGPU backend.

MRT configurations assigned via `setMRT()` apply to the default pass only. OIT-qualified objects contribute to the color output but not to custom MRT outputs since a pixel may accumulate multiple transparent surfaces.

References:

*   [https://jcgt.org/published/0002/02/09/](https://jcgt.org/published/0002/02/09/)
*   [https://casual-effects.blogspot.com/2014/03/weighted-blended-order-independent.html](https://casual-effects.blogspot.com/2014/03/weighted-blended-order-independent.html)

## Code Example

```js
const renderPipeline = new THREE.RenderPipeline( renderer );
renderPipeline.outputNode = oitPass( scene, camera );
```

## Import

OITPassNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { oitPass } from 'three/addons/tsl/display/OITPassNode.js';
```

## Constructor

### new OITPassNode( scene : Scene, camera : Camera, options : Object )

Constructs a new OIT pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

**options**

Options for the internal render target.

Default is `{}`.

## Properties

### .isOITPassNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .weightNode : Node.<float>

The depth-based weight of a transparent fragment, see equations (7) to (9) in the paper. When `null`, equation (9) is used. Must be assigned before the first render.

Default is `null`.

## Source

[examples/jsm/tsl/display/OITPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/OITPassNode.js)