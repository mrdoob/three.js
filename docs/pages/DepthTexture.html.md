*Inheritance: EventDispatcher → Texture →*

# DepthTexture

This class can be used to automatically save the depth information of a rendering into a texture.

## Constructor

### new DepthTexture( width : number, height : number, type : number, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, anisotropy : number, format : number, depth : number )

Constructs a new depth texture.

**width**

The width of the texture.

**height**

The height of the texture.

**type**

The texture type.

Default is `UnsignedIntType`.

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

Default is `LinearFilter`.

**anisotropy**

The anisotropy value.

Default is `Texture.DEFAULT_ANISOTROPY`.

**format**

The texture format.

Default is `DepthFormat`.

**depth**

The depth of the texture.

Default is `1`.

## Properties

### .compareFunction : NeverCompare | LessCompare | EqualCompare | LessEqualCompare | GreaterCompare | NotEqualCompare | GreaterEqualCompare | AlwaysCompare

Code corresponding to the depth compare function.

Default is `null`.

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

### .isDepthTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/textures/DepthTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/DepthTexture.js)