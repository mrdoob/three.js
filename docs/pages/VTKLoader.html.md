*Inheritance: Loader →*

# VTKLoader

A loader for the VTK format.

This loader only supports the `POLYDATA` dataset format so far. Other formats (structured points, structured grid, rectilinear grid, unstructured grid, appended) are not supported.

## Code Example

```js
const loader = new VTKLoader();
const geometry = await loader.loadAsync( 'models/vtk/liver.vtk' );
geometry.computeVertexNormals();
const mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial() );
scene.add( mesh );
```

## Import

VTKLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VTKLoader } from 'three/addons/loaders/VTKLoader.js';
```

## Constructor

### new VTKLoader( manager : LoadingManager )

Constructs a new VTK loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded VRML asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer ) : BufferGeometry

Parses the given VTK data and returns the resulting geometry.

**data**

The raw VTK data as an array buffer

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed geometry.

## Source

[examples/jsm/loaders/VTKLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/VTKLoader.js)