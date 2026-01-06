*Inheritance: Loader → DataTextureLoader →*

# EXRLoader

A loader for the OpenEXR texture format.

`EXRLoader` currently supports uncompressed, ZIP(S), RLE, PIZ and DWA/B compression. Supports reading as UnsignedByte, HalfFloat and Float type data texture.

## Code Example

```js
const loader = new EXRLoader();
const texture = await loader.loadAsync( 'textures/memorial.exr' );
```

## Import

EXRLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
```

## Constructor

### new EXRLoader( manager : LoadingManager )

Constructs a new EXR loader.

**manager**

The loading manager.

## Properties

### .outputFormat : RGBAFormat | RGFormat | RedFormat

Texture output format.

Default is `RGBAFormat`.

### .type : HalfFloatType | FloatType

The texture type.

Default is `HalfFloatType`.

## Methods

### .parse( buffer : ArrayBuffer ) : DataTextureLoader~TexData

Parses the given EXR texture data.

**buffer**

The raw texture data.

**Overrides:** [DataTextureLoader#parse](DataTextureLoader.html#parse)

**Returns:** An object representing the parsed texture data.

### .setDataType( value : HalfFloatType | FloatType ) : EXRLoader

Sets the texture type.

**value**

The texture type to set.

**Returns:** A reference to this loader.

### .setOutputFormat( value : RGBAFormat | RGFormat | RedFormat ) : EXRLoader

Sets texture output format. Defaults to `RGBAFormat`.

**value**

Texture output format.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/EXRLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/EXRLoader.js)