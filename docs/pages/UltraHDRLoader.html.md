*Inheritance: Loader →*

# UltraHDRLoader

A loader for the Ultra HDR Image Format.

Existing HDR or EXR textures can be converted to Ultra HDR with this [tool](https://gainmap-creator.monogrid.com/).

Current feature set:

*   JPEG headers (required)
*   XMP metadata (legacy format, supported)
*   ISO 21496-1 metadata (current standard, supported)
*   XMP validation (not implemented)
*   EXIF profile (not implemented)
*   ICC profile (not implemented)
*   Binary storage for SDR & HDR images (required)
*   Gainmap metadata (required)
*   Non-JPEG image formats (not implemented)
*   Primary image as an HDR image (not implemented)

## Code Example

```js
const loader = new UltraHDRLoader();
const texture = await loader.loadAsync( 'textures/equirectangular/ice_planet_close.jpg' );
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = texture;
scene.environment = texture;
```

## Import

UltraHDRLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js';
```

## Constructor

### new UltraHDRLoader( manager : LoadingManager )

Constructs a new Ultra HDR loader.

**manager**

The loading manager.

## Properties

### .type : HalfFloatType | FloatType

The texture type.

Default is `HalfFloatType`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : DataTexture

Starts loading from the given URL and passes the loaded Ultra HDR texture to the `onLoad()` callback.

**url**

The path/URL of the files to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The Ultra HDR texture.

### .parse( buffer : ArrayBuffer, onLoad : function )

Parses the given Ultra HDR texture data.

**buffer**

The raw texture data.

**onLoad**

The `onLoad` callback.

**Overrides:** [Loader#parse](Loader.html#parse)

### .setDataType( value : HalfFloatType | FloatType ) : UltraHDRLoader

Sets the texture type.

**value**

The texture type to set.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/UltraHDRLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/UltraHDRLoader.js)