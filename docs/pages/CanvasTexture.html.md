*Inheritance: EventDispatcher → Texture →*

# CanvasTexture

Creates a texture from a canvas element.

This is almost the same as the base texture class, except that it sets [Texture#needsUpdate](Texture.html#needsUpdate) to `true` immediately since a canvas can directly be used for rendering.

## Constructor

### new CanvasTexture( canvas : HTMLCanvasElement, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number )

Constructs a new texture.

**canvas**

The HTML canvas element.

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

## Properties

### .isCanvasTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/textures/CanvasTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/CanvasTexture.js)