*Inheritance: Loader →*

# SPZLoader

A loader for compressed Gaussian splat `.spz` files.

This loader decodes the format into `BufferGeometry` for use with `GaussianSplat`. Higher-order spherical harmonics are exposed as optional `sphericalHarmonics1` through `sphericalHarmonics3` packed uint32 geometry attributes (`SH_BAND_WORDS[ degree ]` words per splat). Coefficients use the clamped-byte encoding `( value - 128 ) / 128`, four bytes per word.

## Code Example

```js
const loader = new SPZLoader();
const data = await loader.loadAsync( './models/gsplat/example.spz' );
scene.add( new GaussianSplat( data ) );
```

## Import

SPZLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { SPZLoader } from 'three/addons/loaders/SPZLoader.js';
```

## Constructor

### new SPZLoader( manager : LoadingManager )

Constructs a new Gaussian splat SPZ loader.

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

### .parse( buffer : ArrayBuffer, onLoad : function, onError : onErrorCallback ) : BufferGeometry | Promise.<BufferGeometry> | undefined

Decompresses and parses the given `.spz` data.

**buffer**

The raw SPZ file as an array buffer.

**onLoad**

Executed when the parsing process has been finished.

**onError**

Executed when errors occur.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed splat geometry, or a promise for SPZ v4 data.

### .parseRawSPZ( bytes : Uint8Array ) : BufferGeometry

Parses raw SPZ data after gzip decompression.

**bytes**

The decompressed SPZ data.

**Returns:** The parsed splat geometry.

### .parseRawSPZV4( bytes : Uint8Array, zstd : ZSTDDecoder ) : BufferGeometry

Parses raw SPZ v4 data.

**bytes**

The raw SPZ v4 data.

**zstd**

The initialized ZSTD decoder.

**Returns:** The parsed splat geometry.

## Source

[examples/jsm/loaders/SPZLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/SPZLoader.js)