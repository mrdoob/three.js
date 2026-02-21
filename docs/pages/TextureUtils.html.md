# TextureUtils

A class containing utility functions for textures.

## Static Methods

### .contain( texture : Texture, aspect : number ) : Texture

Scales the texture as large as possible within its surface without cropping or stretching the texture. The method preserves the original aspect ratio of the texture. Akin to CSS `object-fit: contain`

**texture**

The texture.

**aspect**

The texture's aspect ratio.

**Returns:** The updated texture.

### .cover( texture : Texture, aspect : number ) : Texture

Scales the texture to the smallest possible size to fill the surface, leaving no empty space. The method preserves the original aspect ratio of the texture. Akin to CSS `object-fit: cover`.

**texture**

The texture.

**aspect**

The texture's aspect ratio.

**Returns:** The updated texture.

### .fill( texture : Texture ) : Texture

Configures the texture to the default transformation. Akin to CSS `object-fit: fill`.

**texture**

The texture.

**Returns:** The updated texture.

### .getByteLength( width : number, height : number, format : number, type : number ) : number

Determines how many bytes must be used to represent the texture.

**width**

The width of the texture.

**height**

The height of the texture.

**format**

The texture's format.

**type**

The texture's type.

**Returns:** The byte length.

## Source

[src/extras/TextureUtils.js](https://github.com/mrdoob/three.js/blob/master/src/extras/TextureUtils.js)