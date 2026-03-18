*Inheritance: EventDispatcher → Texture →*

# StorageArrayTexture

This special type of texture is intended for compute shaders. It can be used to compute the data of a texture with a compute shader.

Note: This type of texture can only be used with `WebGPURenderer` and a WebGPU backend.

## Constructor

### new StorageArrayTexture( width : number, height : number, depth : number )

Constructs a new storage texture.

**width**

The storage texture's width.

Default is `1`.

**height**

The storage texture's height.

Default is `1`.

**depth**

The storage texture's depth.

Default is `1`.

## Properties

### .image : Object

The image object which just represents the texture's dimension.

**Overrides:** [Texture#image](Texture.html#image)

### .isStorageTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .magFilter : number

The default `magFilter` for storage textures is `THREE.LinearFilter`.

**Overrides:** [Texture#magFilter](Texture.html#magFilter)

### .minFilter : number

The default `minFilter` for storage textures is `THREE.LinearFilter`.

**Overrides:** [Texture#minFilter](Texture.html#minFilter)

## Methods

### .setSize( width : number, height : number, depth : number )

Sets the size of the storage array texture.

**width**

The new width of the storage texture.

**height**

The new height of the storage texture.

**depth**

The new depth of the storage texture.

## Source

[src/renderers/common/StorageArrayTexture.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/StorageArrayTexture.js)