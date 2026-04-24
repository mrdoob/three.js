*Inheritance: Loader →*

# AMFLoader

A loader for the AMF format.

The loader supports materials, color and ZIP compressed files. No constellation support (yet).

## Code Example

```js
const loader = new AMFLoader();
const object = await loader.loadAsync( './models/amf/rook.amf' );
scene.add( object );
```

## Import

AMFLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { AMFLoader } from 'three/addons/loaders/AMFLoader.js';
```

## Constructor

### new AMFLoader( manager : LoadingManager )

Constructs a new AMF loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded AMF asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer ) : Group

Parses the given AMF data and returns the resulting group.

**data**

The raw AMF asset data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** A group representing the parsed asset.

## Source

[examples/jsm/loaders/AMFLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/AMFLoader.js)