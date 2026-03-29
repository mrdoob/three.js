*Inheritance: Loader →*

# LWOLoader

A loader for the LWO format.

LWO3 and LWO2 formats are supported.

References:

*   [LWO3 format specification](https://static.lightwave3d.com/sdk/2019/html/filefmts/lwo3.html)
*   [LWO2 format specification](https://static.lightwave3d.com/sdk/2019/html/filefmts/lwo2.html)

## Code Example

```js
const loader = new LWOLoader();
const lwoData = await loader.loadAsync( 'models/lwo/Objects/LWO3/Demo.lwo' );
const mesh = object.meshes[ 0 ];
scene.add( mesh );
```

## Import

LWOLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LWOLoader } from 'three/addons/loaders/LWOLoader.js';
```

## Constructor

### new LWOLoader( manager : LoadingManager )

Constructs a new LWO loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded LWO asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( iffBuffer : ArrayBuffer, path : string, modelName : string ) : Object

Parses the given LWO data and returns the resulting meshes and materials.

**iffBuffer**

The raw LWO data as an array buffer.

**path**

The URL base path.

**modelName**

The model name.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** An object holding the parse meshes and materials.

## Source

[examples/jsm/loaders/LWOLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/LWOLoader.js)