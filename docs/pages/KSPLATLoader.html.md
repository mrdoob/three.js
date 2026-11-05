*Inheritance: Loader →*

# KSPLATLoader

A loader for GaussianSplats3D `.ksplat` files.

This loader decodes the format into `BufferGeometry` for use with `GaussianSplat`. Higher-order spherical harmonics are exposed as optional `sphericalHarmonics1` through `sphericalHarmonics3` packed uint32 geometry attributes (`SH_BAND_WORDS[ degree ]` words per splat). Coefficients use the clamped-byte encoding `( value - 128 ) / 128`, four bytes per word.

## Code Example

```js
const loader = new KSPLATLoader();
const data = await loader.loadAsync( './models/gsplat/example.ksplat' );
scene.add( new GaussianSplat( data ) );
```

## Import

KSPLATLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { KSPLATLoader } from 'three/addons/loaders/KSPLATLoader.js';
```

## Constructor

### new KSPLATLoader( manager : LoadingManager )

Constructs a new Gaussian splat KSPLAT loader.

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

Parses the given `.ksplat` data.

**buffer**

The raw KSPLAT file as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed splat geometry.

## Source

[examples/jsm/loaders/KSPLATLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/KSPLATLoader.js)