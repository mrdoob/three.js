*Inheritance: EventDispatcher → Texture → CompressedTexture →*

# CompressedArrayTexture

Creates a texture 2D array based on data in compressed form.

These texture are usually loaded with [CompressedTextureLoader](CompressedTextureLoader.html).

## Constructor

### new CompressedArrayTexture( mipmaps : Array.<Object>, width : number, height : number, depth : number, format : number, type : number )

Constructs a new compressed array texture.

**mipmaps**

This array holds for all mipmaps (including the bases mip) the data and dimensions.

**width**

The width of the texture.

**height**

The height of the texture.

**depth**

The depth of the texture.

**format**

The min filter value.

Default is `RGBAFormat`.

**type**

The min filter value.

Default is `UnsignedByteType`.

## Properties

### .image : Object

The image property of a compressed texture just defines its dimensions.

**Overrides:** [CompressedTexture#image](CompressedTexture.html#image)

### .isCompressedArrayTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .layerUpdates : Set.<number>

A set of all layers which need to be updated in the texture.

### .wrapR : RepeatWrapping | ClampToEdgeWrapping | MirroredRepeatWrapping

This defines how the texture is wrapped in the depth and corresponds to _W_ in UVW mapping.

Default is `ClampToEdgeWrapping`.

## Methods

### .addLayerUpdate( layerIndex : number )

Describes that a specific layer of the texture needs to be updated. Normally when [Texture#needsUpdate](Texture.html#needsUpdate) is set to `true`, the entire compressed texture array is sent to the GPU. Marking specific layers will only transmit subsets of all mipmaps associated with a specific depth in the array which is often much more performant.

**layerIndex**

The layer index that should be updated.

### .clearLayerUpdates()

Resets the layer updates registry.

## Source

[src/textures/CompressedArrayTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/CompressedArrayTexture.js)