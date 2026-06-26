*Inheritance: Loader →*

# LUT3dlLoader

A loader for the 3DL LUT format.

References:

*   [3D LUTs](http://download.autodesk.com/us/systemdocs/help/2011/lustre/index.html?url=./files/WSc4e151a45a3b785a24c3d9a411df9298473-7ffd.htm,topicNumber=d0e9492)
*   [Format Spec for .3dl](https://community.foundry.com/discuss/topic/103636/format-spec-for-3dl?mode=Post&postID=895258)

## Code Example

```js
const loader = new LUT3dlLoader();
const map = loader.loadAsync( 'luts/Presetpro-Cinematic.3dl' );
```

## Import

LUT3dlLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LUT3dlLoader } from 'three/addons/loaders/LUT3dlLoader.js';
```

## Constructor

### new LUT3dlLoader( manager : LoadingManager )

Constructs a new 3DL LUT loader.

**manager**

The loading manager.

## Classes

[LUT3dlLoader](LUT3dlLoader.html)

## Properties

### .type : UnsignedByteType | FloatType

The texture type.

Default is `UnsignedByteType`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded 3DL LUT asset to the `onLoad()` callback.

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

Parses the given 3DL LUT data and returns the resulting 3D data texture.

**input**

The raw 3DL LUT data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed 3DL LUT.

### .setType( type : UnsignedByteType | FloatType ) : LUT3dlLoader

Sets the texture type.

**type**

The texture type to set.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/LUT3dlLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/LUT3dlLoader.js)