*Inheritance: EventDispatcher → Texture → DepthTexture →*

# CubeDepthTexture

This class can be used to automatically save the depth information of a cube rendering into a cube texture with depth format. Used for PointLight shadows.

## Constructor

### new CubeDepthTexture( size : number, type : number, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, anisotropy : number, format : number )

Constructs a new cube depth texture.

**size**

The size (width and height) of each cube face.

**type**

The texture type.

Default is `UnsignedIntType`.

**mapping**

The texture mapping.

Default is `CubeReflectionMapping`.

**wrapS**

The wrapS value.

Default is `ClampToEdgeWrapping`.

**wrapT**

The wrapT value.

Default is `ClampToEdgeWrapping`.

**magFilter**

The mag filter value.

Default is `NearestFilter`.

**minFilter**

The min filter value.

Default is `NearestFilter`.

**anisotropy**

The anisotropy value.

Default is `Texture.DEFAULT_ANISOTROPY`.

**format**

The texture format.

Default is `DepthFormat`.

## Properties

### .images : Array.<Image>

Alias for [CubeDepthTexture#image](CubeDepthTexture.html#image).

### .isCubeDepthTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .isCubeTexture : boolean (readonly)

Set to true for cube texture handling in WebGLTextures.

Default is `true`.

## Source

[src/textures/CubeDepthTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/CubeDepthTexture.js)