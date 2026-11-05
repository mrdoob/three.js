*Inheritance: LightShadow →*

# SunLightShadow

Represents the shadow configuration of [SunLight](SunLight.html), using two cascaded shadow maps (CSM).

The shadow camera projection is fitted automatically to slices of the view frustum, up to a distance of `camera.far` (or the view camera's far plane, whichever is smaller), and adjacent cascades blend into each other over a small depth range. `camera.left/right/top/bottom` are ignored.

The default `mapSize` is `1024x1024` per cascade.

## Import

SunLightShadow is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { SunLightShadow } from 'three/addons/lights/SunLightShadow.js';
```

## Constructor

### new SunLightShadow()

Constructs a new sun light shadow.

## Properties

### .isSunLightShadow : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .getCamera( cascadeIndex : number ) : OrthographicCamera

Returns the shadow camera of the given cascade.

**cascadeIndex**

The cascade index.

Default is `0`.

**Overrides:** [LightShadow#getCamera](LightShadow.html#getCamera)

**Returns:** The shadow camera.

### .getFrustum( cascadeIndex : number ) : Frustum

Returns the shadow camera frustum of the given cascade. Used internally by the renderer to cull objects.

**cascadeIndex**

The cascade index.

Default is `0`.

**Overrides:** [LightShadow#getFrustum](LightShadow.html#getFrustum)

**Returns:** The shadow camera frustum.

### .getMatrix( cascadeIndex : number ) : Matrix4

Returns the shadow matrix of the given cascade.

**cascadeIndex**

The cascade index.

Default is `0`.

**Returns:** The shadow matrix.

### .updateMatrices( light : Light, viewCamera : Camera )

Update the matrices for the cascade cameras and shadows, used internally by the renderer.

**light**

The light for which the shadow is being rendered.

**viewCamera**

The camera the scene is rendered with.

**Overrides:** [LightShadow#updateMatrices](LightShadow.html#updateMatrices)

## Source

[examples/jsm/lights/SunLightShadow.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lights/SunLightShadow.js)