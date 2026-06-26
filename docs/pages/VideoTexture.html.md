*Inheritance: EventDispatcher → Texture →*

# VideoTexture

A texture for use with a video.

Note: When using video textures with [WebGPURenderer](WebGPURenderer.html), [Texture#colorSpace](Texture.html#colorSpace) must be set to THREE.SRGBColorSpace.

Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. Instead, call [Texture#dispose](Texture.html#dispose) on the texture and instantiate a new one.

## Code Example

```js
// assuming you have created a HTML video element with id="video"
const video = document.getElementById( 'video' );
const texture = new THREE.VideoTexture( video );
```

## Constructor

### new VideoTexture( video : HTMLVideoElement, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number )

Constructs a new video texture.

**video**

The video element to use as a data source for the texture.

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

### .generateMipmaps : boolean

Whether to generate mipmaps (if possible) for a texture.

Overwritten and set to `false` by default.

Default is `false`.

**Overrides:** [Texture#generateMipmaps](Texture.html#generateMipmaps)

### .isVideoTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .update()

This method is called automatically by the renderer and sets [Texture#needsUpdate](Texture.html#needsUpdate) to `true` every time a new frame is available.

Only relevant if `requestVideoFrameCallback` is not supported in the browser.

## Source

[src/textures/VideoTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/VideoTexture.js)