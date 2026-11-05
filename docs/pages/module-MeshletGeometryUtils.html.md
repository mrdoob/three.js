# MeshletGeometryUtils

## Import

MeshletGeometryUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import * as MeshletGeometryUtils from 'three/addons/utils/MeshletGeometryUtils.js';
```

Utilities to process geometries into clusters (meshlets) of 64 triangles with a chain of simplified levels of detail, used by the meshlet drawing pipelines.

## Static Properties

### .MAX_LODS : number (constant)

The maximum number of levels of detail of a geometry.

### .MESHLET_SIZE : number (constant)

The number of triangles of a meshlet. Meshlets are padded with degenerate triangles to this size.

### .ready : Promise (constant)

Resolves when the meshoptimizer modules are ready to process geometries.

## Static Methods

### .createMeshlets( geometry : BufferGeometry, group : Object ) : Object

Builds meshlets of 64 triangles and a chain of simplified levels of detail for the given geometry. Identical vertices are welded first and all levels index the same vertices. The vertex data is interleaved into one storage buffer and accessed through the returned functions.

**geometry**

The geometry, with position and normal attributes.

**group**

An optional material group whose triangles are processed independently.

Default is `null`.

**Returns:** The meshlet data.

## Source

[examples/jsm/utils/MeshletGeometryUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/MeshletGeometryUtils.js)