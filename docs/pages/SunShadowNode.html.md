*Inheritance: EventDispatcher → Node → ShadowBaseNode → ShadowNode →*

# SunShadowNode

Represents the cascaded shadow map of a [SunLight](SunLight.html).

The two cascade cameras are fitted by [SunLightShadow](SunLightShadow.html) and rendered into the viewports of a single shadow map atlas. Each fragment walks the cascades back to front, blending across the fade bands between them.

## Import

SunShadowNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { sunShadow } from 'three/addons/lights/SunShadowNode.js';
```

## Constructor

### new SunShadowNode( light : SunLight, shadow : SunLightShadow )

Constructs a new sun shadow node.

**light**

The shadow casting sun light.

**shadow**

An optional sun light shadow.

Default is `null`.

## Methods

### .renderShadow( frame : NodeFrame )

Renders the two cascades into the viewports of the shadow map atlas.

**frame**

A reference to the current node frame.

**Overrides:** [ShadowNode#renderShadow](ShadowNode.html#renderShadow)

### .setupRenderTarget( shadow : SunLightShadow, builder : NodeBuilder ) : Object

Overwrites the default implementation to size the render target as the cascade atlas.

**shadow**

The light shadow object.

**builder**

A reference to the current node builder.

**Returns:** An object containing the shadow map and depth texture.

### .setupShadow( builder : NodeBuilder ) : Node.<float>

Sets up the atlas render target and shadow output node.

**builder**

A reference to the current node builder.

**Overrides:** [ShadowNode#setupShadow](ShadowNode.html#setupShadow)

**Returns:** The shadow output node.

### .vsmPass( renderer : Renderer )

Overwritten as a no-op since VSM is not supported for cascaded shadow maps.

**renderer**

A reference to the current renderer.

**Overrides:** [ShadowNode#vsmPass](ShadowNode.html#vsmPass)

## Source

[examples/jsm/lights/SunShadowNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lights/SunShadowNode.js)