# CSM

An implementation of Cascade Shadow Maps (CSM).

This module can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), use [CSMShadowNode](CSMShadowNode.html) instead.

## Import

CSM is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSM } from 'three/addons/csm/CSM.js';
```

## Constructor

### new CSM( data : CSM~Data )

Constructs a new CSM instance.

**data**

The CSM data.

## Classes

[CSM](CSM.html)

## Properties

### .breaks : Array.<number>

An array of numbers in the range `[0,1]` the defines how the mainCSM frustum should be split up.

### .camera : Camera

The scene's camera.

### .cascades : number

The number of cascades.

Default is `3`.

### .customSplitsCallback : function

Custom split callback when using `mode='custom'`.

### .fade : boolean

Whether to fade between cascades or not.

Default is `false`.

### .frustums : Array.<CSMFrustum>

An array of frustums representing the cascades.

### .lightDirection : Vector3

The light direction.

### .lightFar : number

The light far value.

Default is `2000`.

### .lightIntensity : number

The light intensity.

Default is `3`.

### .lightMargin : number

The light margin.

Default is `200`.

### .lightNear : number

The light near value.

Default is `1`.

### .lights : Array.<DirectionalLight>

An array of directional lights which cast the shadows for the different cascades. There is one directional light for each cascade.

### .mainFrustum : CSMFrustum

The main frustum.

### .maxFar : number

The maximum far value.

Default is `100000`.

### .mode : 'practical' | 'uniform' | 'logarithmic' | 'custom'

The frustum split mode.

Default is `'practical'`.

### .parent : Object3D

The parent object, usually the scene.

### .shaders : Map.<Material, Object>

A Map holding enhanced material shaders.

### .shadowBias : number

The shadow bias.

Default is `0.000001`.

### .shadowMapSize : number

The shadow map size.

Default is `2048`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .remove()

Applications must call this method when they remove the CSM usage from their scene.

### .setupMaterial( material : Material )

Applications must call this method for all materials that should be affected by CSM.

**material**

The material to setup for CSM support.

### .update()

Updates the CSM. This method must be called in your animation loop before calling `renderer.render()`.

### .updateFrustums()

Applications must call this method every time they change camera or CSM settings.

## Type Definitions

### .Data

Constructor data of `CSM`.

**camera**  
[Camera](Camera.html)

The scene's camera.

**parent**  
[Object3D](Object3D.html)

The parent object, usually the scene.

**cascades**  
number

The number of cascades.

Default is `3`.

**maxFar**  
number

The maximum far value.

Default is `100000`.

**mode**  
'practical' | 'uniform' | 'logarithmic' | 'custom'

The frustum split mode.

Default is `'practical'`.

**customSplitsCallback**  
function

Custom split callback when using `mode='custom'`.

**shadowMapSize**  
number

The shadow map size.

Default is `2048`.

**shadowBias**  
number

The shadow bias.

Default is `0.000001`.

**lightDirection**  
[Vector3](Vector3.html)

The light direction.

**lightIntensity**  
number

The light intensity.

Default is `3`.

**lightNear**  
number

The light near value.

Default is `1`.

**lightNear**  
number

The light far value.

Default is `2000`.

**lightMargin**  
number

The light margin.

Default is `200`.

## Source

[examples/jsm/csm/CSM.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/csm/CSM.js)