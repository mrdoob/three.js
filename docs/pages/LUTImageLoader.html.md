*Inheritance: Loader →*

# LUTImageLoader

A loader for loading LUT images.

## Code Example

```js
const loader = new LUTImageLoader();
const map = loader.loadAsync( 'luts/NeutralLUT.png' );
```

## Import

LUTImageLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LUTImageLoader } from 'three/addons/loaders/LUTImageLoader.js';
```

## Constructor

### new LUTImageLoader( manager : LoadingManager )

Constructs a new LUT loader.

**manager**

The loading manager.

## Classes

[LUTImageLoader](LUTImageLoader.html)

## Properties

### .flip : boolean

Whether to vertically flip the LUT or not.

Depending on the LUT's origin, the texture has green at the bottom (e.g. for Unreal) or green at the top (e.g. for Unity URP Color Lookup). If you're using lut image strips from a Unity pipeline, then set this property to `true`.

Default is `false`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded LUT to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( dataArray : Uint8ClampedArray, size : number ) : Object

Parses the given LUT data and returns the resulting 3D data texture.

**dataArray**

The raw LUT data.

**size**

The LUT size.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** An object representing the parsed LUT.

## Source

[examples/jsm/loaders/LUTImageLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/LUTImageLoader.js)