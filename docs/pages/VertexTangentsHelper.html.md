*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# VertexTangentsHelper

Visualizes an object's vertex tangents.

Requires that tangents have been specified in the geometry as a buffer attribute or have been calculated using [BufferGeometry#computeTangents](BufferGeometry.html#computeTangents).

## Code Example

```js
const helper = new VertexTangentsHelper( mesh, 1, 0xff0000 );
scene.add( helper );
```

## Import

VertexTangentsHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VertexTangentsHelper } from 'three/addons/helpers/VertexTangentsHelper.js';
```

## Constructor

### new VertexTangentsHelper( object : Object3D, size : number, color : number | Color | string )

Constructs a new vertex tangents helper.

**object**

The object for which to visualize vertex tangents.

**size**

The helper's size.

Default is `1`.

**color**

The helper's color.

Default is `0xff0000`.

## Properties

### .matrixAutoUpdate : boolean

Overwritten and set to `false` since the object's world transformation is encoded in the helper's geometry data.

Default is `false`.

**Overrides:** [LineSegments#matrixAutoUpdate](LineSegments.html#matrixAutoUpdate)

### .object : Object3D

The object for which to visualize vertex tangents.

### .size : number

The helper's size.

Default is `1`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the vertex normals preview based on the object's world transform.

## Source

[examples/jsm/helpers/VertexTangentsHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/VertexTangentsHelper.js)