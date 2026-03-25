*Inheritance: EventDispatcher →*

# Texture

Base class for all textures.

Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. Instead, call [Texture#dispose](Texture.html#dispose) on the texture and instantiate a new one.

## Constructor

### new Texture( image : Object, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number, colorSpace : string )

Constructs a new texture.

**image**

The image holding the texture data.

Default is `Texture.DEFAULT_IMAGE`.

**mapping**

The texture mapping.

Default is `Texture.DEFAULT_MAPPING`.

**wrapS**

The wrapS value.

Default is `ClampToEdgeWrapping`.

**wrapT**

The wrapT value.

Default is `ClampToEdgeWrapping`.

**magFilter**

The mag filter value.

Default is `LinearFilter`.

**minFilter**

The min filter value.

Default is `LinearMipmapLinearFilter`.

**format**

The texture format.

Default is `RGBAFormat`.

**type**

The texture type.

Default is `UnsignedByteType`.

**anisotropy**

The anisotropy value.

Default is `Texture.DEFAULT_ANISOTROPY`.

**colorSpace**

The color space.

Default is `NoColorSpace`.

## Properties

### .anisotropy : number

The number of samples taken along the axis through the pixel that has the highest density of texels. By default, this value is `1`. A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used.

Default is `Texture.DEFAULT_ANISOTROPY`.

### .center : Vector2

The point around which rotation occurs. A value of `(0.5, 0.5)` corresponds to the center of the texture. Default is `(0, 0)`, the lower left.

Default is `(0,0)`.

### .channel : number

Lets you select the uv attribute to map the texture to. `0` for `uv`, `1` for `uv1`, `2` for `uv2` and `3` for `uv3`.

Default is `0`.

### .colorSpace : string

Textures containing color data should be annotated with `SRGBColorSpace` or `LinearSRGBColorSpace`.

Default is `NoColorSpace`.

### .depth

The depth of the texture in pixels.

### .flipY : boolean

If set to `true`, the texture is flipped along the vertical axis when uploaded to the GPU.

Note that this property has no effect when using `ImageBitmap`. You need to configure the flip on bitmap creation instead.

Default is `true`.

### .format : number

The format of the texture.

Default is `RGBAFormat`.

### .generateMipmaps : boolean

Whether to generate mipmaps (if possible) for a texture.

Set this to `false` if you are creating mipmaps manually.

Default is `true`.

### .height

The height of the texture in pixels.

### .id : number (readonly)

The ID of the texture.

### .image : Object

The image object holding the texture data.

### .internalFormat : string

The default internal format is derived from [Texture#format](Texture.html#format) and [Texture#type](Texture.html#type) and defines how the texture data is going to be stored on the GPU.

This property allows to overwrite the default format.

Default is `null`.

### .isArrayTexture : boolean (readonly)

Indicates if a texture should be handled like a texture array.

Default is `false`.

### .isRenderTargetTexture : boolean (readonly)

Indicates whether a texture belongs to a render target or not.

Default is `false`.

### .isTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .magFilter : NearestFilter | NearestMipmapNearestFilter | NearestMipmapLinearFilter | LinearFilter | LinearMipmapNearestFilter | LinearMipmapLinearFilter

How the texture is sampled when a texel covers more than one pixel.

Default is `LinearFilter`.

### .mapping : UVMapping | CubeReflectionMapping | CubeRefractionMapping | EquirectangularReflectionMapping | EquirectangularRefractionMapping | CubeUVReflectionMapping

How the texture is applied to the object. The value `UVMapping` is the default, where texture or uv coordinates are used to apply the map.

Default is `UVMapping`.

### .matrix : Matrix3

The uv-transformation matrix of the texture.

### .matrixAutoUpdate : boolean

Whether to update the texture's uv-transformation [Texture#matrix](Texture.html#matrix) from the properties [Texture#offset](Texture.html#offset), [Texture#repeat](Texture.html#repeat), [Texture#rotation](Texture.html#rotation), and [Texture#center](Texture.html#center).

Set this to `false` if you are specifying the uv-transform matrix directly.

Default is `true`.

### .minFilter : NearestFilter | NearestMipmapNearestFilter | NearestMipmapLinearFilter | LinearFilter | LinearMipmapNearestFilter | LinearMipmapLinearFilter

How the texture is sampled when a texel covers less than one pixel.

Default is `LinearMipmapLinearFilter`.

### .mipmaps : Array.<Object>

An array holding user-defined mipmaps.

### .name : string

The name of the texture.

### .needsPMREMUpdate : boolean

Setting this property to `true` indicates the engine the PMREM must be regenerated.

Default is `false`.

### .needsUpdate : boolean

Setting this property to `true` indicates the engine the texture must be updated in the next render. This triggers a texture upload to the GPU and ensures correct texture parameter configuration.

Default is `false`.

### .offset : Vector2

How much a single repetition of the texture is offset from the beginning, in each direction U and V. Typical range is `0.0` to `1.0`.

Default is `(0,0)`.

### .onUpdate : function

A callback function, called when the texture is updated (e.g., when [Texture#needsUpdate](Texture.html#needsUpdate) has been set to true and then the texture is used).

Default is `null`.

### .pmremVersion : number (readonly)

Indicates whether this texture should be processed by `PMREMGenerator` or not (only relevant for render target textures).

Default is `0`.

### .premultiplyAlpha : boolean

If set to `true`, the alpha channel, if present, is multiplied into the color channels when the texture is uploaded to the GPU.

Note that this property has no effect when using `ImageBitmap`. You need to configure premultiply alpha on bitmap creation instead.

Default is `false`.

### .renderTarget : RenderTarget | WebGLRenderTarget

An optional back reference to the textures render target.

Default is `null`.

### .repeat : Vector2

How many times the texture is repeated across the surface, in each direction U and V. If repeat is set greater than `1` in either direction, the corresponding wrap parameter should also be set to `RepeatWrapping` or `MirroredRepeatWrapping` to achieve the desired tiling effect.

Default is `(1,1)`.

### .rotation : number

How much the texture is rotated around the center point, in radians. Positive values are counter-clockwise.

Default is `0`.

### .source : Source

The data definition of a texture. A reference to the data source can be shared across textures. This is often useful in context of spritesheets where multiple textures render the same data but with different texture transformations.

### .type : number

The data type of the texture.

Default is `UnsignedByteType`.

### .unpackAlignment : number

Specifies the alignment requirements for the start of each pixel row in memory. The allowable values are `1` (byte-alignment), `2` (rows aligned to even-numbered bytes), `4` (word-alignment), and `8` (rows start on double-word boundaries).

Default is `4`.

### .updateRanges : Array.<Object>

This can be used to only update a subregion or specific rows of the texture (for example, just the first 3 rows). Use the `addUpdateRange()` function to add ranges to this array.

### .userData : Object

An object that can be used to store custom data about the texture. It should not hold references to functions as these will not be cloned.

### .uuid : string (readonly)

The UUID of the texture.

### .version : number (readonly)

This starts at `0` and counts how many times [Texture#needsUpdate](Texture.html#needsUpdate) is set to `true`.

Default is `0`.

### .width

The width of the texture in pixels.

### .wrapS : RepeatWrapping | ClampToEdgeWrapping | MirroredRepeatWrapping

This defines how the texture is wrapped horizontally and corresponds to _U_ in UV mapping.

Default is `ClampToEdgeWrapping`.

### .wrapT : RepeatWrapping | ClampToEdgeWrapping | MirroredRepeatWrapping

This defines how the texture is wrapped horizontally and corresponds to _V_ in UV mapping.

Default is `ClampToEdgeWrapping`.

### .DEFAULT_ANISOTROPY : number

The default anisotropy value for all textures.

Default is `1`.

### .DEFAULT_IMAGE : Image

The default image for all textures.

Default is `null`.

### .DEFAULT_MAPPING : number

The default mapping for all textures.

Default is `UVMapping`.

## Methods

### .addUpdateRange( start : number, count : number )

Adds a range of data in the data texture to be updated on the GPU.

**start**

Position at which to start update.

**count**

The number of components to update.

### .clearUpdateRanges()

Clears the update ranges.

### .clone() : Texture

Returns a new texture with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( source : Texture ) : Texture

Copies the values of the given texture to this instance.

**source**

The texture to copy.

**Returns:** A reference to this instance.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

##### Fires:

*   [Texture#event:dispose](Texture.html#event:dispose)

### .setValues( values : Object )

Sets this texture's properties based on `values`.

**values**

A container with texture parameters.

### .toJSON( meta : Object | string ) : Object

Serializes the texture into JSON.

**meta**

An optional value holding meta information about the serialization.

See:

*   [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** A JSON object representing the serialized texture.

### .transformUv( uv : Vector2 ) : Vector2

Transforms the given uv vector with the textures uv transformation matrix.

**uv**

The uv vector.

**Returns:** The transformed uv vector.

### .updateMatrix()

Updates the texture transformation matrix from the from the properties [Texture#offset](Texture.html#offset), [Texture#repeat](Texture.html#repeat), [Texture#rotation](Texture.html#rotation), and [Texture#center](Texture.html#center).

## Events

### .dispose

Fires when the texture has been disposed of.

##### Type:

*   Object

## Source

[src/textures/Texture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/Texture.js)