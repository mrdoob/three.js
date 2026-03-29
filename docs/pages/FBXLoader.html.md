*Inheritance: Loader →*

# FBXLoader

A loader for the FBX format.

Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format. Versions lower than this may load but will probably have errors.

Needs Support:

*   Morph normals / blend shape normals

FBX format references:

*   [C++ SDK reference](https://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html)

Binary format specification:

*   [FBX binary file format specification](https://code.blender.org/2013/08/fbx-binary-file-format-specification/)

## Code Example

```js
const loader = new FBXLoader();
const object = await loader.loadAsync( 'models/fbx/stanford-bunny.fbx' );
scene.add( object );
```

## Import

FBXLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
```

## Constructor

### new FBXLoader( manager : LoadingManager )

Constructs a new FBX loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded FBX asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( FBXBuffer : ArrayBuffer, path : string ) : Group

Parses the given FBX data and returns the resulting group.

**FBXBuffer**

The raw FBX data as an array buffer.

**path**

The URL base path.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** An object representing the parsed asset.

## Source

[examples/jsm/loaders/FBXLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/FBXLoader.js)