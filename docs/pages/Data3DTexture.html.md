*Inheritance: EventDispatcher → Texture →*

# Data3DTexture

Creates a three-dimensional texture from raw data, with parameters to divide it into width, height, and depth.

## Constructor

### new Data3DTexture( data : TypedArray, width : number, height : number, depth : number )

Constructs a new data array texture.

**data**

The buffer data.

Default is `null`.

**width**

The width of the texture.

Default is `1`.

**height**

The height of the texture.

Default is `1`.

**depth**

The depth of the texture.

Default is `1`.

## Properties

### .flipY : boolean

If set to `true`, the texture is flipped along the vertical axis when uploaded to the GPU.

Overwritten and set to `false` by default.

Default is `false`.

**Overrides:** [Texture#flipY](Texture.html#flipY)

### .generateMipmaps : boolean

Whether to generate mipmaps (if possible) for a texture.

Overwritten and set to `false` by default.

Default is `false`.

**Overrides:** [Texture#generateMipmaps](Texture.html#generateMipmaps)

### .image : Object

The image definition of a data texture.

**Overrides:** [Texture#image](Texture.html#image)

### .isData3DTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .magFilter : NearestFilter | NearestMipmapNearestFilter | NearestMipmapLinearFilter | LinearFilter | LinearMipmapNearestFilter | LinearMipmapLinearFilter

How the texture is sampled when a texel covers more than one pixel.

Overwritten and set to `NearestFilter` by default.

Default is `NearestFilter`.

**Overrides:** [Texture#magFilter](Texture.html#magFilter)

### .minFilter : NearestFilter | NearestMipmapNearestFilter | NearestMipmapLinearFilter | LinearFilter | LinearMipmapNearestFilter | LinearMipmapLinearFilter

How the texture is sampled when a texel covers less than one pixel.

Overwritten and set to `NearestFilter` by default.

Default is `NearestFilter`.

**Overrides:** [Texture#minFilter](Texture.html#minFilter)

### .unpackAlignment : boolean

Specifies the alignment requirements for the start of each pixel row in memory.

Overwritten and set to `1` by default.

Default is `1`.

**Overrides:** [Texture#unpackAlignment](Texture.html#unpackAlignment)

### .wrapR : RepeatWrapping | ClampToEdgeWrapping | MirroredRepeatWrapping

This defines how the texture is wrapped in the depth and corresponds to _W_ in UVW mapping.

Default is `ClampToEdgeWrapping`.

## Source

[src/textures/Data3DTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/Data3DTexture.js)