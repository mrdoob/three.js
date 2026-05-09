*Inheritance: Loader →*

# ColladaLoader

A loader for the Collada format.

The Collada format is very complex so this loader only supports a subset of what is defined in the [official specification](https://www.khronos.org/files/collada_spec_1_5.pdf).

Assets with a Z-UP coordinate system are transformed it into Y-UP by a simple rotation. The vertex data are not converted.

## Code Example

```js
const loader = new ColladaLoader();
const result = await loader.loadAsync( './models/collada/elf/elf.dae' );
scene.add( result.scene );
```

## Import

ColladaLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
```

## Constructor

### new ColladaLoader()

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded Collada asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( text : string, path : string ) : Object

Parses the given Collada data and returns a result object holding the parsed scene, an array of animation clips and kinematics.

**text**

The raw Collada data as a string.

**path**

The asset path.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** An object representing the parsed asset.

## Source

[examples/jsm/loaders/ColladaLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/ColladaLoader.js)