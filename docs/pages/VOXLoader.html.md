*Inheritance: Loader →*

# VOXLoader

A loader for the VOX format.

## Code Example

```js
const loader = new VOXLoader();
const result = await loader.loadAsync( 'models/vox/monu10.vox' );
scene.add( result.scene.children[ 0 ] );
```

## Import

VOXLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VOXLoader } from 'three/addons/loaders/VOXLoader.js';
```

## Constructor

### new VOXLoader()

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded VOX asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( buffer : ArrayBuffer ) : Object

Parses the given VOX data and returns the result object.

**buffer**

The raw VOX data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed VOX data with properties: chunks, scene.

## Source

[examples/jsm/loaders/VOXLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/VOXLoader.js)