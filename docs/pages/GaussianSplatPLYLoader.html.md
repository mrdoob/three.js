*Inheritance: Loader →*

# GaussianSplatPLYLoader

A loader for Gaussian splat PLY files, e.g. as exported by the original GraphDECO/INRIA 3D Gaussian Splatting implementation.

PLY itself is a generic format, so the caller would normally have to know the file's spherical harmonics (SH) degree ahead of time to configure `PLYLoader` with the right custom property mapping before parsing. This loader avoids that by scanning the plain-text PLY header for `f_rest_N` properties first, since SH degree maps to a fixed, closed table of `f_rest` counts (0/9/24/45 -> degree 0/1/2/3), and configuring an internal `PLYLoader` accordingly before converting the result into Gaussian splat geometry.

## Code Example

```js
const loader = new GaussianSplatPLYLoader();
const geometry = await loader.loadAsync( './models/gsplat/point_cloud.ply' );
scene.add( new GaussianSplat( geometry ) );
```

## Import

GaussianSplatPLYLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { GaussianSplatPLYLoader } from 'three/addons/loaders/GaussianSplatPLYLoader.js';
```

## Constructor

### new GaussianSplatPLYLoader( manager : LoadingManager )

Constructs a new Gaussian splat PLY loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded Gaussian splat geometry to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer | string ) : BufferGeometry

Parses the given Gaussian splat PLY data and returns the resulting Gaussian splat geometry.

This scans the PLY header for the file's spherical harmonics degree, so unlike a plain `PLYLoader`, no prior setup is required.

**data**

The raw PLY data, as an array buffer or string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed Gaussian splat geometry.

## Source

[examples/jsm/loaders/GaussianSplatPLYLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/GaussianSplatPLYLoader.js)