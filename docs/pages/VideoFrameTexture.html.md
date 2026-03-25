*Inheritance: EventDispatcher → Texture → VideoTexture →*

# VideoFrameTexture

This class can be used as an alternative way to define video data. Instead of using an instance of `HTMLVideoElement` like with `VideoTexture`, `VideoFrameTexture` expects each frame is defined manually via [VideoFrameTexture#setFrame](VideoFrameTexture.html#setFrame). A typical use case for this module is when video frames are decoded with the WebCodecs API.

## Code Example

```js
const texture = new THREE.VideoFrameTexture();
texture.setFrame( frame );
```

## Constructor

### new VideoFrameTexture( mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number )

Constructs a new video frame texture.

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

### .isVideoFrameTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .setFrame( frame : VideoFrame )

Sets the current frame of the video. This will automatically update the texture so the data can be used for rendering.

**frame**

The video frame.

### .update()

This method overwritten with an empty implementation since this type of texture is updated via `setFrame()`.

**Overrides:** [VideoTexture#update](VideoTexture.html#update)

## Source

[src/textures/VideoFrameTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/VideoFrameTexture.js)