*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# VertexNormalsHelper

Visualizes an object's vertex normals.

Requires that normals have been specified in the geometry as a buffer attribute or have been calculated using [BufferGeometry#computeVertexNormals](BufferGeometry.html#computeVertexNormals).

## Code Example

```js
const geometry = new THREE.BoxGeometry( 10, 10, 10, 2, 2, 2 );
const material = new THREE.MeshStandardMaterial();
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
const helper = new VertexNormalsHelper( mesh, 1, 0xff0000 );
scene.add( helper );
```

## Import

VertexNormalsHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
```

## Constructor

### new VertexNormalsHelper( object : Object3D, size : number, color : number | Color | string )

Constructs a new vertex normals helper.

**object**

The object for which to visualize vertex normals.

**size**

The helper's size.

Default is `1`.

**color**

The helper's color.

Default is `0xff0000`.

## Properties

### .isVertexNormalsHelper : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .matrixAutoUpdate : boolean

Overwritten and set to `false` since the object's world transformation is encoded in the helper's geometry data.

Default is `false`.

**Overrides:** [LineSegments#matrixAutoUpdate](LineSegments.html#matrixAutoUpdate)

### .object : Object3D

The object for which to visualize vertex normals.

### .size : number

The helper's size.

Default is `1`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the vertex normals preview based on the object's world transform.

## Source

[examples/jsm/helpers/VertexNormalsHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/VertexNormalsHelper.js)