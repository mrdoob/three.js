*Inheritance: Loader →*

# SPLATLoader

A loader for standard fixed-width Gaussian splat `.splat` files.

This loader decodes the format into `BufferGeometry` for use with `GaussianSplat`. Each 32-byte row stores center, scale, color and rotation data for one splat.

## Code Example

```js
const loader = new SPLATLoader();
const data = await loader.loadAsync( './models/gsplat/example.splat' );
scene.add( new GaussianSplat( data ) );
```

## Import

SPLATLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { SPLATLoader } from 'three/addons/loaders/SPLATLoader.js';
```

## Constructor

### new SPLATLoader( manager : LoadingManager )

Constructs a new Gaussian splat loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded splat data to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( buffer : ArrayBuffer ) : BufferGeometry

Parses the given fixed-width `.splat` data.

**buffer**

The raw `.splat` file as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed splat geometry.

## Source

[examples/jsm/loaders/SPLATLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/SPLATLoader.js)