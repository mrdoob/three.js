*Inheritance: Loader →*

# USDLoader

A loader for the USD format (USD, USDA, USDC, USDZ).

Supports both ASCII (USDA) and binary (USDC) USD files, as well as USDZ archives containing either format.

## Code Example

```js
const loader = new USDLoader();
const model = await loader.loadAsync( 'model.usdz' );
scene.add( model );
```

## Import

USDLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { USDLoader } from 'three/addons/loaders/USDLoader.js';
```

## Constructor

### new USDLoader( manager : LoadingManager )

Constructs a new USDZ loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded USDZ asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( buffer : ArrayBuffer | string ) : Group

Parses the given USDZ data and returns the resulting group.

**buffer**

The raw USDZ data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed asset as a group.

## Source

[examples/jsm/loaders/USDLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/USDLoader.js)