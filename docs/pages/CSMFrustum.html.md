# CSMFrustum

Represents the frustum of a CSM instance.

## Import

CSMFrustum is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSMFrustum } from 'three/addons/csm/CSMFrustum.js';
```

## Constructor

### new CSMFrustum( data : CSMFrustum~Data )

Constructs a new CSM frustum.

**data**

The CSM data.

## Properties

### .vertices : Object

An object representing the vertices of the near and far plane in view space.

### .zNear : number

The zNear value. This value depends on whether the CSM is used with WebGL or WebGPU. Both API use different conventions for their projection matrices.

## Methods

### .setFromProjectionMatrix( projectionMatrix : Matrix4, maxFar : number ) : Object

Setups this CSM frustum from the given projection matrix and max far value.

**projectionMatrix**

The projection matrix, usually of the scene's camera.

**maxFar**

The maximum far value.

**Returns:** An object representing the vertices of the near and far plane in view space.

### .split( breaks : Array.<number>, target : Array.<CSMFrustum> )

Splits the CSM frustum by the given array. The new CSM frustum are pushed into the given target array.

**breaks**

An array of numbers in the range `[0,1]` the defines how the CSM frustum should be split up.

**target**

The target array that holds the new CSM frustums.

### .toSpace( cameraMatrix : Matrix4, target : CSMFrustum )

Transforms the given target CSM frustum into the different coordinate system defined by the given camera matrix.

**cameraMatrix**

The matrix that defines the new coordinate system.

**target**

The CSM to convert.

## Type Definitions

### .Data

Constructor data of `CSMFrustum`.

**webGL**  
boolean

Whether this CSM frustum is used with WebGL or WebGPU.

**projectionMatrix**  
[Matrix4](Matrix4.html)

A projection matrix usually of the scene's camera.

**maxFar**  
number

The maximum far value.

## Source

[examples/jsm/csm/CSMFrustum.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/csm/CSMFrustum.js)