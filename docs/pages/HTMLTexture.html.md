*Inheritance: EventDispatcher → Texture →*

# HTMLTexture

Creates a texture from an HTML element.

This is almost the same as the base texture class, except that it sets [Texture#needsUpdate](Texture.html#needsUpdate) to `true` immediately and listens for the parent canvas's paint events to trigger updates.

## Constructor

### new HTMLTexture( element : HTMLElement, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number )

Constructs a new texture.

**element**

The HTML element.

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

### .isHTMLTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/textures/HTMLTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/HTMLTexture.js)