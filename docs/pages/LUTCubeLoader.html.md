*Inheritance: Loader →*

# LUTCubeLoader

A loader for the Cube LUT format.

References:

*   [Cube LUT Specification](https://web.archive.org/web/20220220033515/https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf)

## Code Example

```js
const loader = new LUTCubeLoader();
const map = loader.loadAsync( 'luts/Bourbon 64.CUBE' );
```

## Import

LUTCubeLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LUTCubeLoader } from 'three/addons/loaders/LUTCubeLoader.js';
```

## Constructor

### new LUTCubeLoader( manager : LoadingManager )

Constructs a new Cube LUT loader.

**manager**

The loading manager.

## Classes

[LUTCubeLoader](LUTCubeLoader.html)

## Properties

### .type : UnsignedByteType | FloatType

The texture type.

Default is `UnsignedByteType`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded Cube LUT asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( input : string ) : Object

Parses the given Cube LUT data and returns the resulting 3D data texture.

**input**

The raw Cube LUT data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed Cube LUT.

### .setType( type : UnsignedByteType | FloatType ) : LUTCubeLoader

Sets the texture type.

**type**

The texture type to set.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/LUTCubeLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/LUTCubeLoader.js)