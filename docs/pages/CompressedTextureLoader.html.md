*Inheritance: Loader →*

# CompressedTextureLoader

Abstract base class for loading compressed texture formats S3TC, ASTC or ETC. Textures are internally loaded via [FileLoader](FileLoader.html).

Derived classes have to implement the `parse()` method which holds the parsing for the respective format.

## Constructor

### new CompressedTextureLoader( manager : LoadingManager ) (abstract)

Constructs a new compressed texture loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback ) : CompressedTexture

Starts loading from the given URL and passes the loaded compressed texture to the `onLoad()` callback. The method also returns a new texture object which can directly be used for material creation. If you do it this way, the texture may pop up in your scene once the respective loading process is finished.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** The compressed texture.

## Type Definitions

### .TexData

Represents the result object type of the `parse()` method.

**width**  
number

The width of the base mip.

**height**  
number

The width of the base mip.

**isCubemap**  
boolean

Whether the data represent a cubemap or not.

**mipmapCount**  
number

The mipmap count.

**mipmaps**  
Array.<{data:TypedArray, width:number, height:number}>

An array holding the mipmaps. Each entry holds the data and the dimensions for each level.

**format**  
number

The texture format.

## Source

[src/loaders/CompressedTextureLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/CompressedTextureLoader.js)