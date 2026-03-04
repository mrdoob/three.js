*Inheritance: Loader →*

# Rhino3dmLoader

A loader for Rhinoceros 3D files and objects.

Rhinoceros is a 3D modeler used to create, edit, analyze, document, render, animate, and translate NURBS curves, surfaces, breps, extrusions, point clouds, as well as polygon meshes and SubD objects. `rhino3dm.js` is compiled to WebAssembly from the open source geometry library `openNURBS`. The loader currently uses `rhino3dm.js 8.4.0`.

## Code Example

```js
const loader = new Rhino3dmLoader();
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@8.0.1' );
const object = await loader.loadAsync( 'models/3dm/Rhino_Logo.3dm' );
scene.add( object );
```

## Import

Rhino3dmLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';
```

## Constructor

### new Rhino3dmLoader( manager : LoadingManager )

Constructs a new Rhino 3DM loader.

**manager**

The loading manager.

## Methods

### .debug()

Prints debug messages to the browser console.

### .decodeObjects( buffer : ArrayBuffer, url : string ) : Promise.<Object3D>

Decodes the 3DM asset data with a Web Worker.

**buffer**

The raw 3DM asset data as an array buffer.

**url**

The asset URL.

**Returns:** A Promise that resolved with the decoded 3D object.

### .dispose()

Frees internal resources. This method should be called when the loader is no longer required.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded 3DM asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer, onLoad : function, onError : onErrorCallback )

Parses the given 3DM data and passes the loaded 3DM asset to the `onLoad()` callback.

**data**

The raw 3DM asset data as an array buffer.

**onLoad**

Executed when the loading process has been finished.

**onError**

Executed when errors occur.

**Overrides:** [Loader#parse](Loader.html#parse)

### .setLibraryPath( path : string ) : Rhino3dmLoader

Path to a folder containing the JS and WASM libraries.

**path**

The library path to set.

**Returns:** A reference to this loader.

### .setWorkerLimit( workerLimit : number ) : Rhino3dmLoader

Sets the maximum number of Web Workers to be used during decoding. A lower limit may be preferable if workers are also for other tasks in the application.

**workerLimit**

The worker limit.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/3DMLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/3DMLoader.js)