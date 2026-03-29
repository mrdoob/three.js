*Inheritance: EventDispatcher → Texture →*

# CompressedTexture

Creates a texture based on data in compressed form.

These texture are usually loaded with [CompressedTextureLoader](CompressedTextureLoader.html).

## Constructor

### new CompressedTexture( mipmaps : Array.<Object>, width : number, height : number, format : number, type : number, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, anisotropy : number, colorSpace : string )

Constructs a new compressed texture.

**mipmaps**

This array holds for all mipmaps (including the bases mip) the data and dimensions.

**width**

The width of the texture.

**height**

The height of the texture.

**format**

The texture format.

Default is `RGBAFormat`.

**type**

The texture type.

Default is `UnsignedByteType`.

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

**anisotropy**

The anisotropy value.

Default is `Texture.DEFAULT_ANISOTROPY`.

**colorSpace**

The color space.

Default is `NoColorSpace`.

## Properties

### .flipY : boolean (readonly)

If set to `true`, the texture is flipped along the vertical axis when uploaded to the GPU.

Overwritten and set to `false` by default since it is not possible to flip compressed textures.

Default is `false`.

**Overrides:** [Texture#flipY](Texture.html#flipY)

### .generateMipmaps : boolean (readonly)

Whether to generate mipmaps (if possible) for a texture.

Overwritten and set to `false` by default since it is not possible to generate mipmaps for compressed data. Mipmaps must be embedded in the compressed texture file.

Default is `false`.

**Overrides:** [Texture#generateMipmaps](Texture.html#generateMipmaps)

### .image : Object

The image property of a compressed texture just defines its dimensions.

**Overrides:** [Texture#image](Texture.html#image)

### .isCompressedTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .mipmaps : Array.<Object>

This array holds for all mipmaps (including the bases mip) the data and dimensions.

**Overrides:** [Texture#mipmaps](Texture.html#mipmaps)

## Source

[src/textures/CompressedTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/CompressedTexture.js)