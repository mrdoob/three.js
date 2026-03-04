*Inheritance: Loader →*

# DRACOLoader

A loader for the Draco format.

[Draco](https://google.github.io/draco/) is an open source library for compressing and decompressing 3D meshes and point clouds. Compressed geometry can be significantly smaller, at the cost of additional decoding time on the client device.

Standalone Draco files have a `.drc` extension, and contain vertex positions, normals, colors, and other attributes. Draco files do not contain materials, textures, animation, or node hierarchies – to use these features, embed Draco geometry inside of a glTF file. A normal glTF file can be converted to a Draco-compressed glTF file using [glTF-Pipeline](https://github.com/CesiumGS/gltf-pipeline). When using Draco with glTF, an instance of `DRACOLoader` will be used internally by [GLTFLoader](GLTFLoader.html).

It is recommended to create one DRACOLoader instance and reuse it to avoid loading and creating multiple decoder instances.

`DRACOLoader` will automatically use either the JS or the WASM decoding library, based on browser capabilities.

## Code Example

```js
const loader = new DRACOLoader();
loader.setDecoderPath( '/examples/jsm/libs/draco/' );
const geometry = await dracoLoader.loadAsync( 'models/draco/bunny.drc' );
geometry.computeVertexNormals(); // optional
dracoLoader.dispose();
```

## Import

DRACOLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
```

## Constructor

### new DRACOLoader( manager : LoadingManager )

Constructs a new Draco loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded Draco asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( buffer : ArrayBuffer, onLoad : function, onError : onErrorCallback )

Parses the given Draco data.

**buffer**

The raw Draco data as an array buffer.

**onLoad**

Executed when the loading/parsing process has been finished.

**onError**

Executed when errors occur.

**Overrides:** [Loader#parse](Loader.html#parse)

### .setDecoderConfig( config : Object ) : DRACOLoader

Provides configuration for the decoder libraries. Configuration cannot be changed after decoding begins.

**config**

The decoder config.

**Returns:** A reference to this loader.

### .setDecoderPath( path : string ) : DRACOLoader

Provides configuration for the decoder libraries. Configuration cannot be changed after decoding begins.

**path**

The decoder path.

**Returns:** A reference to this loader.

### .setWorkerLimit( workerLimit : number ) : DRACOLoader

Sets the maximum number of Web Workers to be used during decoding. A lower limit may be preferable if workers are also for other tasks in the application.

**workerLimit**

The worker limit.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/DRACOLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/DRACOLoader.js)