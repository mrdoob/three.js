*Inheritance: Loader →*

# DataTextureLoader

Abstract base class for loading binary texture formats RGBE, EXR or TGA. Textures are internally loaded via [FileLoader](FileLoader.html).

Derived classes have to implement the `parse()` method which holds the parsing for the respective format.

## Constructor

### new DataTextureLoader( manager : LoadingManager ) (abstract)

Constructs a new data texture loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : DataTexture

Starts loading from the given URL and passes the loaded data texture to the `onLoad()` callback. The method also returns a new texture object which can directly be used for material creation. If you do it this way, the texture may pop up in your scene once the respective loading process is finished.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The data texture.

## Type Definitions

### .TexData

Represents the result object type of the `parse()` method.

**image**  
Object

An object holding width, height and the texture data.

**width**  
number

The width of the base mip.

**height**  
number

The width of the base mip.

**data**  
TypedArray

The texture data.

**format**  
number

The texture format.

**type**  
number

The texture type.

**flipY**  
boolean

If set to `true`, the texture is flipped along the vertical axis when uploaded to the GPU.

**wrapS**  
number

The wrapS value.

Default is `ClampToEdgeWrapping`.

**wrapT**  
number

The wrapT value.

Default is `ClampToEdgeWrapping`.

**anisotropy**  
number

The anisotropy value.

Default is `1`.

**generateMipmaps**  
boolean

Whether to generate mipmaps or not.

**colorSpace**  
string

The color space.

**magFilter**  
number

The mag filter.

**minFilter**  
number

The min filter.

**mipmaps**  
Array.<Object>

The mipmaps.

## Source

[src/loaders/DataTextureLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/DataTextureLoader.js)