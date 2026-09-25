*Inheritance: Loader →*

# MaterialXLoader

A loader for the MaterialX format.

The node materials loaded with this loader can only be used with [WebGPURenderer](WebGPURenderer.html). Besides plain `.mtlx` documents, the loader accepts `.mtlx.zip` archives that bundle a document with its textures.

## Code Example

```js
const loader = new MaterialXLoader().setPath( SAMPLE_PATH );
const { materials } = await loader.loadAsync( 'standard_surface_brass_tiled.mtlx' );
```

## Import

MaterialXLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { MaterialXLoader } from 'three/addons/loaders/MaterialXLoader.js';
```

## Constructor

### new MaterialXLoader( manager : LoadingManager )

Constructs a new MaterialX loader.

**manager**

The loading manager.

## Methods

### .dispose() : MaterialXLoader

Frees the resources of the last loaded archive.

**Returns:** A reference to this loader.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback, options : Object ) : MaterialXLoader

Starts loading from the given URL and passes the loaded MaterialX asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished. Receives the parse result, see [MaterialXLoader#parse](MaterialXLoader.html#parse).

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**options**

Parse options, see [MaterialXLoader#parse](MaterialXLoader.html#parse).

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** A reference to this loader.

### .loadAsync( url : string, onProgress : onProgressCallback | Object, options : Object ) : Promise.<Object>

Async version of [MaterialXLoader#load](MaterialXLoader.html#load). The progress callback can be omitted and the parse options passed as the second argument instead.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onProgress**

Executed while the loading is in progress, or the parse options.

**options**

Parse options, see [MaterialXLoader#parse](MaterialXLoader.html#parse).

**Overrides:** [Loader#loadAsync](Loader.html#loadAsync)

**Returns:** A Promise that resolves with the parse result.

### .parse( text : string, options : Object ) : Object

Parses the given MaterialX document and returns the resulting materials together with the translation log.

**text**

The raw MaterialX data as a string.

**options**

Parse options.

**path**

The base path for resolving resources like textures. Defaults to the loader's path.

**materialName**

Only translate the material with this name. Defaults to all materials.

**uvSpace**

The UV space of the document's textures, `'bottom-left'` or `'top-left'`.

Default is `'bottom-left'`.

**interfaceValidator**

Validates node interfaces, see `createStrictInterfaceValidator()` in `MaterialXInterfaceValidation.js`.

**throwOnErrors**

Whether translation errors throw or are only reported in the log.

Default is `true`.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The materials keyed by name and the translation log.

### .parseBuffer( data : ArrayBuffer | Uint8Array | string, url : string, options : Object ) : Object

Parses a raw MaterialX document or a `.mtlx.zip` archive and returns the resulting materials.

**data**

The MaterialX document or archive.

**url**

The URL the data was loaded from, used to resolve relative resource paths.

Default is `''`.

**options**

Parse options, see [MaterialXLoader#parse](MaterialXLoader.html#parse).

**Returns:** The parse result, see [MaterialXLoader#parse](MaterialXLoader.html#parse).

## Source

[examples/jsm/loaders/MaterialXLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/MaterialXLoader.js)